from __future__ import annotations

from decimal import Decimal

from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.db import transaction
from django.db.models import Case, IntegerField, Prefetch, Q, When
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, parser_classes, permission_classes
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .authentication import CsrfExemptSessionAuthentication
from .import_sources import autoparse_category_image_source, autoparse_product_image_sources
from .models import Cart, CartItem, Category, ContactRequest, Order, OrderItem, Product, ProductImage, Review, User
from .permissions import IsAdminUserCookie
from .serializers import (
    CartItemCreateSerializer,
    CartItemUpdateSerializer,
    CategoryPayloadSerializer,
    ContactRequestCreateSerializer,
    ContactRequestStatusSerializer,
    CreateOrderSerializer,
    LoginSerializer,
    MediaAutoparseSerializer,
    OrderStatusSerializer,
    ProfileUpdateSerializer,
    RegisterSerializer,
    ReviewPayloadSerializer,
    SortSerializer,
    TwoGisReviewImportSerializer,
)
from .utils import (
    CATEGORY_IMAGE_HEADERS,
    CatalogImportNode,
    CatalogImportSheet,
    PRODUCT_IMAGE_HEADER_RE,
    materialize_category_image,
    materialize_product_images,
    bool_from_value,
    build_media_url,
    decimal_or_none,
    make_unique_slug,
    is_flat_excel_import,
    parse_catalog_excel,
    parse_excel_upload,
    append_product_images,
    remove_media_directory,
    remove_media_file,
    remove_product_media,
    store_uploaded_file,
    ticket_number,
    extract_2gis_reviews_api_url,
    fetch_json,
    fetch_url_text,
    normalize_2gis_reviews_url,
    remove_category_media,
    unique_media_references,
)


ORDER_STATUSES = {"new", "processing", "completed", "cancelled"}
CONTACT_REQUEST_STATUSES = {"new", "in_progress", "done"}


def message_ok() -> Response:
    return Response({"message": "OK"})


def serialize_user(user: User) -> dict:
    return {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "phone": user.phone,
        "is_admin": user.is_admin,
    }


def to_float(value: Decimal | None) -> float | None:
    return float(value) if value is not None else None


def serialize_category(request, category: Category, *, admin: bool = False) -> dict:
    return {
        "id": str(category.id),
        "slug": category.slug,
        "title": category.title,
        "parent_id": str(category.parent_id) if category.parent_id else None,
        "image_url": category.image_url if admin else build_media_url(request, category.image_url),
        "sort": category.sort,
    }


def serialize_category_tree(request, category: Category, by_parent: dict[str, list[Category]]) -> dict:
    return {
        **serialize_category(request, category),
        "children": [
            serialize_category_tree(request, child, by_parent)
            for child in by_parent.get(str(category.id), [])
        ],
    }


def serialize_product_card(request, product: Product) -> dict:
    return {
        "id": str(product.id),
        "slug": product.slug,
        "title": product.title,
        "price": to_float(product.price),
        "images": [{"url": build_media_url(request, image.image_path)} for image in product.images.all()],
    }


def serialize_product(request, product: Product) -> dict:
    return {
        "id": str(product.id),
        "title": product.title,
        "slug": product.slug,
        "sku": product.sku,
        "category_id": str(product.category_id),
        "price": to_float(product.price),
        "thickness": to_float(product.thickness),
        "color": product.color,
        "material": product.material,
        "description": product.description,
        "is_published": product.is_published,
        "sort": product.sort,
        "images": [
            {"id": str(image.id), "url": build_media_url(request, image.image_path), "sort": image.sort}
            for image in product.images.all()
        ],
    }


def serialize_order(request, order: Order) -> dict:
    return {
        "id": str(order.id),
        "ticket_number": order.ticket_number,
        "status": order.status,
        "customer_name": order.customer_name,
        "customer_email": order.customer_email,
        "customer_phone": order.customer_phone,
        "comment": order.comment,
        "total_items": order.total_items,
        "total_price": to_float(order.total_price),
        "created_at": order.created_at.isoformat(),
        "items": [
            {
                "id": str(item.id),
                "quantity": item.quantity,
                "price": to_float(item.price),
                "title": item.title_snapshot,
                "product": {
                    "id": str(item.product.id) if item.product_id else None,
                    "slug": item.product.slug if item.product_id else None,
                    "images": (
                        [{"url": build_media_url(request, image.image_path)} for image in item.product.images.all()]
                        if item.product_id
                        else []
                    ),
                },
            }
            for item in order.items.all()
        ],
    }


def serialize_contact_request(request, contact_request: ContactRequest) -> dict:
    return {
        "id": str(contact_request.id),
        "name": contact_request.name,
        "email": contact_request.email,
        "phone": contact_request.phone,
        "message": contact_request.message,
        "attachment_url": build_media_url(request, contact_request.attachment_path),
        "status": contact_request.status,
        "created_at": contact_request.created_at.isoformat(),
        "updated_at": contact_request.updated_at.isoformat(),
    }


def split_review_body(body: str | None) -> list[str]:
    if not body:
        return []

    paragraphs = [part.strip() for part in body.replace("\r\n", "\n").split("\n\n")]
    return [paragraph for paragraph in paragraphs if paragraph]


def serialize_review(request, review: Review, *, admin: bool = False) -> dict:
    payload = {
        "id": str(review.id),
        "name": review.name,
        "city": review.city,
        "role": review.role or "Клиент",
        "avatar_url": build_media_url(request, review.avatar_path),
        "image_url": build_media_url(request, review.image_path),
        "is_published": review.is_published,
        "sort": review.sort,
        "created_at": review.created_at.isoformat(),
    }

    if admin:
        payload["body"] = review.body
        payload["text"] = split_review_body(review.body)
        return payload

    payload["text"] = split_review_body(review.body)
    return payload


def get_active_cart(user: User) -> Cart:
    cart, _ = Cart.objects.get_or_create(user=user, status="active")
    return cart


def delete_session_cookie(response: Response) -> None:
    response.delete_cookie("sessionid", path="/", domain=settings.SESSION_COOKIE_DOMAIN)


@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data["email"].lower()
    if User.objects.filter(email=email).exists():
        return Response({"detail": "EMAIL_ALREADY_EXISTS"}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(
        email=email,
        password=serializer.validated_data["password"],
        full_name=(serializer.validated_data.get("full_name") or "").strip() or None,
    )
    login(request, user)
    return Response(serialize_user(user))


@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = authenticate(
        request,
        email=serializer.validated_data["email"].lower(),
        password=serializer.validated_data["password"],
    )
    if not user:
        return Response({"detail": "INVALID_CREDENTIALS"}, status=status.HTTP_401_UNAUTHORIZED)

    login(request, user)
    return Response(serialize_user(user))


@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([AllowAny])
def admin_login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = authenticate(
        request,
        email=serializer.validated_data["email"].lower(),
        password=serializer.validated_data["password"],
    )
    if not user:
        return Response({"detail": "INVALID_CREDENTIALS"}, status=status.HTTP_401_UNAUTHORIZED)
    if not user.is_admin:
        return Response({"detail": "ADMIN_REQUIRED"}, status=status.HTTP_403_FORBIDDEN)

    login(request, user)
    return Response(serialize_user(user))


@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([AllowAny])
def logout_view(request):
    logout(request)
    response = message_ok()
    delete_session_cookie(response)
    return response


@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def me_view(request):
    if request.user.is_admin:
        return Response({"detail": "ADMIN_SESSION"}, status=status.HTTP_401_UNAUTHORIZED)
    return Response(serialize_user(request.user))


@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminUserCookie])
def admin_me_view(request):
    return Response(serialize_user(request.user))


@api_view(["GET"])
@permission_classes([AllowAny])
def root_categories_view(request):
    rows = Category.objects.filter(parent__isnull=True).order_by("sort", "title")
    return Response([serialize_category(request, category) for category in rows])


@api_view(["GET"])
@permission_classes([AllowAny])
def children_categories_view(request, slug: str):
    parent = Category.objects.filter(slug=slug).first()
    if not parent:
        return Response([])
    rows = Category.objects.filter(parent=parent).order_by("sort", "title")
    return Response([serialize_category(request, category) for category in rows])


@api_view(["GET"])
@permission_classes([AllowAny])
def category_detail_view(request, slug: str):
    category = Category.objects.filter(slug=slug).first()
    if not category:
        return Response({"detail": "CATEGORY_NOT_FOUND"}, status=status.HTTP_404_NOT_FOUND)
    return Response(serialize_category(request, category))


@api_view(["GET"])
@permission_classes([AllowAny])
def catalog_tree_view(request):
    rows = list(Category.objects.all().order_by("sort", "title"))
    by_parent: dict[str, list[Category]] = {}
    roots: list[Category] = []

    for category in rows:
        if category.parent_id:
            by_parent.setdefault(str(category.parent_id), []).append(category)
        else:
            roots.append(category)

    return Response(
        [serialize_category_tree(request, root, by_parent) for root in roots]
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def products_by_category_view(request, slug: str):
    category = Category.objects.filter(slug=slug).first()
    if not category:
        return Response([])

    rows = (
        Product.objects.filter(category=category, is_published=True)
        .prefetch_related("images")
        .order_by("sort", "-created_at")
    )
    return Response([serialize_product_card(request, product) for product in rows])


@api_view(["GET"])
@permission_classes([AllowAny])
def product_details_view(request, slug: str):
    product = (
        Product.objects.filter(slug=slug)
        .prefetch_related("images")
        .first()
    )
    if not product:
        return Response({"detail": "PRODUCT_NOT_FOUND"}, status=status.HTTP_404_NOT_FOUND)

    return Response(
        {
            "id": str(product.id),
            "slug": product.slug,
            "title": product.title,
            "description": product.description,
            "price": to_float(product.price),
            "product_images": [
                {"url": build_media_url(request, image.image_path), "sort": image.sort}
                for image in product.images.all()
            ],
        }
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def reviews_view(request):
    rows = Review.objects.filter(is_published=True).order_by("sort", "-created_at")
    return Response([serialize_review(request, review) for review in rows])


@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([AllowAny])
@parser_classes([JSONParser, MultiPartParser, FormParser])
def contact_requests_view(request):
    serializer = ContactRequestCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    contact_request = ContactRequest.objects.create(
        name=serializer.validated_data["name"],
        email=serializer.validated_data.get("email"),
        phone=serializer.validated_data.get("phone"),
        message=serializer.validated_data.get("message"),
        status="new",
    )

    attachment = request.FILES.get("attachment")
    if attachment:
        content_type = (attachment.content_type or "").lower()
        if content_type and not content_type.startswith("image/"):
            contact_request.delete()
            return Response({"detail": "INVALID_ATTACHMENT_TYPE"}, status=status.HTTP_400_BAD_REQUEST)

        contact_request.attachment_path = store_uploaded_file(
            "contact-requests",
            str(contact_request.id),
            attachment,
            prefix="attachment",
        )
        contact_request.save(update_fields=["attachment_path", "updated_at"])

    return Response(serialize_contact_request(request, contact_request), status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def profile_view(request):
    if request.method == "GET":
        return Response(serialize_user(request.user))

    serializer = ProfileUpdateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    request.user.full_name = (serializer.validated_data.get("full_name") or "").strip() or None
    request.user.phone = (serializer.validated_data.get("phone") or "").strip() or None
    request.user.save(update_fields=["full_name", "phone", "updated_at"])
    return Response(serialize_user(request.user))


@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def cart_view(request):
    cart = get_active_cart(request.user)
    items = (
        CartItem.objects.filter(cart=cart)
        .select_related("product")
        .prefetch_related("product__images")
        .order_by("-created_at")
    )
    return Response(
        {
            "items": [
                {
                    "id": str(item.id),
                    "quantity": item.quantity,
                    "product": {
                        "id": str(item.product.id),
                        "slug": item.product.slug,
                        "title": item.product.title,
                        "price": to_float(item.product.price),
                        "images": [
                            {"url": build_media_url(request, image.image_path)}
                            for image in item.product.images.all()
                        ],
                    },
                }
                for item in items
            ]
        }
    )


@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def add_cart_item_view(request):
    serializer = CartItemCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    cart = get_active_cart(request.user)
    product = Product.objects.filter(pk=serializer.validated_data["product_id"]).first()
    if not product:
        return Response({"detail": "PRODUCT_NOT_FOUND"}, status=status.HTTP_404_NOT_FOUND)

    item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
        defaults={"quantity": serializer.validated_data["quantity"]},
    )
    if not created:
        item.quantity += serializer.validated_data["quantity"]
        item.save(update_fields=["quantity", "updated_at"])

    return message_ok()


@api_view(["PATCH", "DELETE"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def cart_item_detail_view(request, item_id):
    cart = get_active_cart(request.user)
    item = CartItem.objects.filter(pk=item_id, cart=cart).first()
    if not item:
        return Response({"detail": "CART_ITEM_NOT_FOUND"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "DELETE":
        item.delete()
        return message_ok()

    serializer = CartItemUpdateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    quantity = serializer.validated_data["quantity"]
    if quantity <= 0:
        item.delete()
    else:
        item.quantity = quantity
        item.save(update_fields=["quantity", "updated_at"])
    return message_ok()


@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def create_order_view(request):
    serializer = CreateOrderSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    cart = get_active_cart(request.user)
    items = (
        CartItem.objects.filter(cart=cart)
        .select_related("product")
        .order_by("created_at")
    )
    if not items.exists():
        return Response({"detail": "CART_IS_EMPTY"}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        total_items = sum(item.quantity for item in items)
        total_price = Decimal("0.00")
        has_price = False
        for item in items:
            if item.product.price is not None:
                total_price += item.product.price * item.quantity
                has_price = True

        order = Order.objects.create(
            ticket_number=ticket_number(),
            user=request.user,
            status="new",
            customer_name=request.user.full_name,
            customer_email=request.user.email,
            customer_phone=request.user.phone,
            comment=(serializer.validated_data.get("comment") or "").strip() or None,
            total_items=total_items,
            total_price=total_price if has_price else None,
        )

        OrderItem.objects.bulk_create(
            [
                OrderItem(
                    order=order,
                    product=item.product,
                    quantity=item.quantity,
                    price=item.product.price,
                    title_snapshot=item.product.title,
                )
                for item in items
            ]
        )

        cart.status = "ordered"
        cart.save(update_fields=["status", "updated_at"])
        items.delete()

    return Response(
        {
            "id": str(order.id),
            "ticket_number": order.ticket_number,
            "status": order.status,
            "total_items": order.total_items,
        }
    )


@api_view(["GET", "POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminUserCookie])
def admin_categories_view(request):
    if request.method == "GET":
        rows = Category.objects.all().order_by("parent_id", "sort", "title")
        return Response([serialize_category(request, category, admin=True) for category in rows])

    serializer = CategoryPayloadSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    parent = None
    parent_id = serializer.validated_data.get("parent_id")
    if parent_id:
        parent = get_object_or_404(Category, pk=parent_id)

    title = serializer.validated_data["title"].strip()
    slug_source = serializer.validated_data.get("slug") or title
    category = Category.objects.create(
        title=title,
        parent=parent,
        image_url=None,
        slug=make_unique_slug(Category, slug_source),
        sort=serializer.validated_data.get("sort") or 0,
    )
    image_url = (serializer.validated_data.get("image_url") or "").strip() or None
    if image_url:
        category.image_url = materialize_category_image(str(category.id), image_url)
        category.save(update_fields=["image_url"])
    return Response(serialize_category(request, category, admin=True))


@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminUserCookie])
def admin_categories_options_view(request):
    rows = Category.objects.all().order_by("title")
    return Response([{"id": str(category.id), "title": category.title} for category in rows])


@api_view(["PUT"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminUserCookie])
def admin_categories_order_view(request):
    serializer = SortSerializer(data=request.data, many=True)
    serializer.is_valid(raise_exception=True)
    mapping = {str(item["id"]): item["sort"] for item in serializer.validated_data}

    rows = Category.objects.filter(id__in=mapping.keys())
    for row in rows:
        row.sort = mapping[str(row.id)]
        row.save(update_fields=["sort"])
    return message_ok()


@api_view(["PUT", "DELETE"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminUserCookie])
def admin_category_detail_view(request, category_id):
    category = get_object_or_404(Category, pk=category_id)

    if request.method == "DELETE":
        if category.children.exists() or category.products.exists():
            return Response({"detail": "CATEGORY_NOT_EMPTY"}, status=status.HTTP_400_BAD_REQUEST)
        remove_category_media(str(category.id))
        category.delete()
        return message_ok()

    serializer = CategoryPayloadSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    parent = None
    parent_id = serializer.validated_data.get("parent_id")
    if parent_id:
        parent = get_object_or_404(Category, pk=parent_id)
        if parent.id == category.id:
            return Response({"detail": "INVALID_PARENT_CATEGORY"}, status=status.HTTP_400_BAD_REQUEST)

    title = serializer.validated_data["title"].strip()
    slug_source = serializer.validated_data.get("slug") or title

    image_url = (serializer.validated_data.get("image_url") or "").strip() or None

    category.title = title
    category.parent = parent
    category.slug = make_unique_slug(Category, slug_source, instance_pk=category.id)
    if serializer.validated_data.get("sort") is not None:
        category.sort = serializer.validated_data["sort"]
    category.image_url = materialize_category_image(str(category.id), image_url) if image_url else None
    if not image_url:
        remove_category_media(str(category.id))
    category.save()
    return Response(serialize_category(request, category, admin=True))


def review_from_request(request, *, instance: Review | None = None) -> Review:
    data = request.data
    serializer = ReviewPayloadSerializer(data=data)
    serializer.is_valid(raise_exception=True)

    name = serializer.validated_data["name"].strip()
    body = serializer.validated_data["body"].strip()
    if not name:
        raise ValueError("NAME_REQUIRED")
    if not body:
        raise ValueError("BODY_REQUIRED")

    review = instance or Review()
    review.name = name
    review.city = (serializer.validated_data.get("city") or "").strip() or None
    review.role = (serializer.validated_data.get("role") or "").strip() or "Клиент"
    review.body = body
    review.is_published = serializer.validated_data.get("is_published", True)
    review.sort = serializer.validated_data.get("sort") or 0
    review._remove_avatar = serializer.validated_data.get("remove_avatar", False)
    review._remove_image = serializer.validated_data.get("remove_image", False)
    return review


def normalize_review_signature(*, name: str, body: str) -> str:
    return " ".join(f"{name}\n{body}".strip().lower().split())


def get_2gis_review_name(review: dict) -> str:
    user = review.get("user") or {}
    return (
        str(user.get("name") or "").strip()
        or str(user.get("first_name") or "").strip()
        or "Пользователь 2ГИС"
    )


def get_2gis_review_avatar(review: dict) -> str | None:
    user = review.get("user") or {}
    preview_urls = user.get("photo_preview_urls") or {}
    for key in ("320x", "640x", "url", "64x64"):
        value = str(preview_urls.get(key) or "").strip()
        if value:
            return value
    return None


def get_2gis_review_image(review: dict) -> str | None:
    for media_item in review.get("media") or []:
        candidates = [
            media_item.get("preview_urls"),
            media_item.get("photo_preview_urls"),
            (media_item.get("photo") or {}).get("preview_urls"),
            (media_item.get("photo") or {}).get("photo_preview_urls"),
            (media_item.get("video") or {}).get("preview_urls"),
        ]
        for preview_urls in candidates:
            if isinstance(preview_urls, dict):
                for key in ("640x", "320x", "url", "64x64", "1920x"):
                    value = str(preview_urls.get(key) or "").strip()
                    if value:
                        return value
        for key in ("url", "src"):
            value = str(media_item.get(key) or "").strip()
            if value:
                return value
        photo = media_item.get("photo") or {}
        for key in ("url", "src"):
            value = str(photo.get(key) or "").strip()
            if value:
                return value
    return None


def iter_2gis_reviews(source_url: str, *, limit: int) -> tuple[list[dict], dict]:
    normalized_source_url = normalize_2gis_reviews_url(source_url)
    page_html = fetch_url_text(normalized_source_url)
    api_url = extract_2gis_reviews_api_url(page_html)

    reviews: list[dict] = []
    total_available: int | None = None
    next_url: str | None = api_url
    visited_urls: set[str] = set()

    while next_url and len(reviews) < limit:
        if next_url in visited_urls:
            break
        visited_urls.add(next_url)

        payload = fetch_json(next_url)
        page_reviews = payload.get("reviews") or []
        if not isinstance(page_reviews, list):
            break

        for review in page_reviews:
            if not isinstance(review, dict):
                continue
            reviews.append(review)
            if len(reviews) >= limit:
                break

        meta = payload.get("meta") if isinstance(payload.get("meta"), dict) else {}
        if total_available is None and meta:
            try:
                total_available = int(meta.get("branch_reviews_count") or meta.get("total_count") or 0)
            except (TypeError, ValueError):
                total_available = None

        next_url = None
        if len(reviews) < limit and meta:
            candidate = str(meta.get("next_link") or "").strip()
            next_url = candidate or None

    return reviews[:limit], {
        "source_url": normalized_source_url,
        "api_url": api_url,
        "total_available": total_available,
    }


def import_2gis_reviews(*, source_url: str, limit: int = 250) -> dict[str, object]:
    remote_reviews, meta = iter_2gis_reviews(source_url, limit=limit)
    existing_reviews = list(Review.objects.all())
    by_signature = {
        normalize_review_signature(name=review.name, body=review.body): review
        for review in existing_reviews
    }
    next_sort = (
        Review.objects.order_by("-sort").values_list("sort", flat=True).first()
    )
    next_sort = (next_sort if isinstance(next_sort, int) else -1) + 1

    created = 0
    updated = 0
    skipped = 0

    for remote_review in remote_reviews:
        body = str(remote_review.get("text") or "").strip()
        if not body:
            skipped += 1
            continue
        if remote_review.get("is_hidden"):
            skipped += 1
            continue

        name = get_2gis_review_name(remote_review)
        rating = remote_review.get("rating")
        role = "2ГИС"
        if rating not in (None, ""):
            role = f"2ГИС • {rating}★"

        signature = normalize_review_signature(name=name, body=body)
        review = by_signature.get(signature)

        if review is None:
            review = Review(
                name=name,
                city="Якутск",
                role=role,
                body=body,
                avatar_path=get_2gis_review_avatar(remote_review),
                image_path=get_2gis_review_image(remote_review),
                is_published=False,
                sort=next_sort,
            )
            review.save()
            by_signature[signature] = review
            next_sort += 1
            created += 1
            continue

        changed = False
        if review.role != role:
            review.role = role
            changed = True
        if not review.city:
            review.city = "Якутск"
            changed = True
        avatar_path = get_2gis_review_avatar(remote_review)
        image_path = get_2gis_review_image(remote_review)
        if avatar_path and review.avatar_path != avatar_path:
            review.avatar_path = avatar_path
            changed = True
        if image_path and review.image_path != image_path:
            review.image_path = image_path
            changed = True
        if changed:
            review.save()
            updated += 1
        else:
            skipped += 1

    return {
        "source_url": meta["source_url"],
        "api_url": meta["api_url"],
        "stats": {
            "fetched": len(remote_reviews),
            "created": created,
            "updated": updated,
            "skipped": skipped,
            "total_available": meta.get("total_available"),
        },
    }


@api_view(["GET", "POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminUserCookie])
@parser_classes([MultiPartParser, FormParser])
def admin_reviews_view(request):
    if request.method == "GET":
        rows = Review.objects.all().order_by("sort", "-created_at")
        return Response([serialize_review(request, review, admin=True) for review in rows])

    try:
        review = review_from_request(request)
    except ValueError as exc:
        return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    review.save()

    avatar = request.FILES.get("avatar")
    image = request.FILES.get("image")
    update_fields: list[str] = []
    if avatar:
        review.avatar_path = store_uploaded_file("reviews", str(review.id), avatar, prefix="avatar")
        update_fields.append("avatar_path")
    if image:
        review.image_path = store_uploaded_file("reviews", str(review.id), image, prefix="image")
        update_fields.append("image_path")
    if update_fields:
        review.save(update_fields=update_fields)

    return Response(serialize_review(request, review, admin=True), status=status.HTTP_201_CREATED)


@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminUserCookie])
@parser_classes([JSONParser])
def admin_reviews_import_2gis_view(request):
    serializer = TwoGisReviewImportSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    try:
        result = import_2gis_reviews(
            source_url=serializer.validated_data["source_url"],
            limit=serializer.validated_data.get("limit") or 250,
        )
    except ValueError as exc:
        return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as exc:
        return Response(
            {
                "detail": "TWOGIS_IMPORT_FAILED",
                "error": str(exc) or exc.__class__.__name__,
            },
            status=status.HTTP_502_BAD_GATEWAY,
        )

    return Response({"message": "OK", **result})


@api_view(["GET", "PUT", "DELETE"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminUserCookie])
@parser_classes([MultiPartParser, FormParser])
def admin_review_detail_view(request, review_id):
    review = get_object_or_404(Review, pk=review_id)

    if request.method == "GET":
        return Response(serialize_review(request, review, admin=True))

    if request.method == "DELETE":
        remove_media_directory("reviews", str(review.id))
        review.delete()
        return message_ok()

    try:
        review = review_from_request(request, instance=review)
    except ValueError as exc:
        return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    avatar = request.FILES.get("avatar")
    image = request.FILES.get("image")

    if getattr(review, "_remove_avatar", False) and review.avatar_path:
        remove_media_file(review.avatar_path)
        review.avatar_path = None
    if getattr(review, "_remove_image", False) and review.image_path:
        remove_media_file(review.image_path)
        review.image_path = None

    if avatar:
        remove_media_file(review.avatar_path)
        review.avatar_path = store_uploaded_file("reviews", str(review.id), avatar, prefix="avatar")
    if image:
        remove_media_file(review.image_path)
        review.image_path = store_uploaded_file("reviews", str(review.id), image, prefix="image")

    review.save()
    return Response(serialize_review(request, review, admin=True))


@api_view(["PUT"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminUserCookie])
def admin_reviews_order_view(request):
    serializer = SortSerializer(data=request.data, many=True)
    serializer.is_valid(raise_exception=True)
    mapping = {str(item["id"]): item["sort"] for item in serializer.validated_data}

    rows = Review.objects.filter(id__in=mapping.keys())
    for row in rows:
        row.sort = mapping[str(row.id)]
        row.save(update_fields=["sort", "updated_at"])
    return message_ok()


@api_view(["PATCH"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminUserCookie])
def admin_review_publish_view(request, review_id):
    review = Review.objects.filter(pk=review_id).first()
    if not review:
        return Response({"detail": "REVIEW_NOT_FOUND"}, status=status.HTTP_404_NOT_FOUND)

    next_value = request.data.get("is_published")
    review.is_published = bool_from_value(next_value, default=not review.is_published)
    review.save(update_fields=["is_published", "updated_at"])
    return Response(serialize_review(request, review, admin=True))


def product_from_request(request, *, instance: Product | None = None) -> Product:
    data = request.data
    title = str(data.get("title", "")).strip()
    category_id = data.get("category_id")
    if not title:
        raise ValueError("TITLE_REQUIRED")
    if not category_id:
        raise ValueError("CATEGORY_REQUIRED")

    category = Category.objects.filter(pk=category_id).first()
    if not category:
        raise ValueError("CATEGORY_NOT_FOUND")

    try:
        price = decimal_or_none(data.get("price"))
        thickness = decimal_or_none(data.get("thickness"))
    except ValueError as exc:
        raise ValueError(str(exc)) from exc

    sku = str(data.get("sku", "")).strip() or None
    slug_source = f"{title}-{sku}" if sku else title
    product = instance or Product()
    product.title = title
    product.sku = sku
    product.slug = make_unique_slug(Product, slug_source, instance_pk=product.pk)
    product.category = category
    product.price = price
    product.thickness = thickness
    product.color = str(data.get("color", "")).strip() or None
    product.material = str(data.get("material", "")).strip() or None
    product.description = str(data.get("description", "")).strip() or None
    product.is_published = bool_from_value(data.get("is_published"), default=True)
    return product


def upsert_category(
    *,
    title: str,
    parent: Category | None,
    sort: int,
    image_url: str | None = None,
) -> tuple[Category, bool]:
    category = Category.objects.filter(parent=parent, title=title).first()
    if category:
        update_fields: list[str] = []
        if category.sort != sort:
            category.sort = sort
            update_fields.append("sort")
        if image_url is not None and image_url:
            next_image_url = materialize_category_image(str(category.id), image_url)
            if category.image_url != next_image_url:
                category.image_url = next_image_url
                update_fields.append("image_url")
        elif image_url == "" and category.image_url:
            remove_category_media(str(category.id))
            category.image_url = None
            update_fields.append("image_url")
        if update_fields:
            category.save(update_fields=update_fields)
        return category, False

    slug_source = f"{parent.slug}-{title}" if parent else title
    category = Category.objects.create(
        title=title,
        parent=parent,
        slug=make_unique_slug(Category, slug_source),
        image_url=None,
        sort=sort,
    )
    if image_url:
        category.image_url = materialize_category_image(str(category.id), image_url)
        category.save(update_fields=["image_url"])
    return category, True


def upsert_product(
    *,
    title: str,
    category: Category,
    sort: int,
    sku: str | None = None,
    price=None,
    thickness=None,
    color: str | None = None,
    material: str | None = None,
    description: str | None = None,
    is_published: bool = True,
) -> tuple[str, Product]:
    product = Product.objects.filter(category=category, title=title).first()
    if product:
        product.sku = sku
        product.price = price
        product.thickness = thickness
        product.color = color
        product.material = material
        product.description = description
        product.is_published = is_published
        product.sort = sort
        product.save()
        return "updated", product

    slug_source = f"{category.slug}-{title}"
    product = Product.objects.create(
        title=title,
        sku=sku,
        slug=make_unique_slug(Product, slug_source),
        category=category,
        price=price,
        thickness=thickness,
        color=color,
        material=material,
        description=description,
        is_published=is_published,
        sort=sort,
    )
    return "created", product


def iter_product_image_headers(row: dict[str, str]) -> list[str]:
    indexed_paths: list[tuple[int, int, str]] = []
    fallback_index = 10_000

    for key, raw_value in row.items():
        header = str(key or "").strip().lower()
        if header in CATEGORY_IMAGE_HEADERS:
            continue

        match = PRODUCT_IMAGE_HEADER_RE.match(header)
        if not match:
            continue

        value = str(raw_value or "").strip()
        if not value:
            continue

        order = int(match.group(1) or fallback_index)
        indexed_paths.append((order, len(indexed_paths), value))
        fallback_index += 1

    return [value for _, _, value in sorted(indexed_paths)]


def replace_imported_product_images(product: Product, image_paths: list[str]) -> int:
    stored_paths = materialize_product_images(str(product.id), image_paths)
    if not stored_paths:
        return 0

    ProductImage.objects.filter(product=product).delete()
    ProductImage.objects.bulk_create(
        [
            ProductImage(product=product, image_path=image_path, sort=index)
            for index, image_path in enumerate(stored_paths)
        ]
    )
    return len(stored_paths)


def extend_import_stats(stats: dict[str, int | str]) -> None:
    stats.update(
        {
            "category_images_from_excel": 0,
            "category_images_autoparsed": 0,
            "category_images_missing": 0,
            "product_images_from_excel": 0,
            "product_images_autoparsed": 0,
            "product_images_missing": 0,
        }
    )


def register_import_image_source(
    stats: dict[str, int | str],
    state_map: dict[str, str],
    *,
    state_key: str,
    prefix: str,
    source: str | None,
) -> None:
    if source is None:
        return

    previous = state_map.get(state_key)
    if previous == source:
        return

    if previous is not None:
        previous_key = f"{prefix}_{previous}"
        stats[previous_key] = max(0, int(stats.get(previous_key, 0)) - 1)

    state_map[state_key] = source
    next_key = f"{prefix}_{source}"
    stats[next_key] = int(stats.get(next_key, 0)) + 1


def import_flat_products(rows: list[dict[str, str]]) -> dict[str, int | str]:
    stats: dict[str, int | str] = {
        "mode": "flat",
        "categories_created": 0,
        "products_created": 0,
        "products_updated": 0,
        "products_skipped": 0,
    }
    extend_import_stats(stats)
    category_image_states: dict[str, str] = {}
    product_image_states: dict[str, str] = {}

    for row in rows:
        category_slug = str(row.get("category_slug", "")).strip()
        category = Category.objects.filter(slug=category_slug).first()
        if not category:
            stats["products_skipped"] += 1
            continue

        category_image = (
            str(row.get("category_image", "")).strip()
            or str(row.get("category_image_url", "")).strip()
        )
        category_image_source: str | None = "from_excel" if category_image else None
        if not category_image and not category.image_url:
            category_image = autoparse_category_image_source(
                category.title,
                parent_title=category.parent.title if category.parent_id else None,
                slug=category.slug,
            ) or ""
            if category_image:
                category_image_source = "autoparsed"
        if category_image and category.image_url != category_image:
            category, _ = upsert_category(
                title=category.title,
                parent=category.parent,
                sort=category.sort,
                image_url=category_image,
            )
        if category_image_source:
            register_import_image_source(
                stats,
                category_image_states,
                state_key=str(category.id),
                prefix="category_images",
                source=category_image_source,
            )
        elif not category.image_url:
            register_import_image_source(
                stats,
                category_image_states,
                state_key=str(category.id),
                prefix="category_images",
                source="missing",
            )

        title = str(row.get("title", "")).strip()
        if not title:
            stats["products_skipped"] += 1
            continue

        try:
            result, product = upsert_product(
                title=title,
                sku=str(row.get("sku", "")).strip() or None,
                category=category,
                price=decimal_or_none(row.get("price")),
                thickness=decimal_or_none(row.get("thickness")),
                color=str(row.get("color", "")).strip() or None,
                material=str(row.get("material", "")).strip() or None,
                description=str(row.get("description", "")).strip() or None,
                is_published=bool_from_value(row.get("is_published"), default=True),
                sort=int(stats["products_created"]) + int(stats["products_updated"]),
            )
        except ValueError:
            stats["products_skipped"] += 1
            continue

        image_paths = iter_product_image_headers(row)
        product_image_source: str | None = "from_excel" if image_paths else None
        if not image_paths:
            image_paths = autoparse_product_image_sources(
                title=title,
                sku=str(row.get("sku", "")).strip() or None,
                category_title=category.title,
                category_slug=category.slug,
            )
            if image_paths:
                product_image_source = "autoparsed"
        if image_paths:
            stored_count = replace_imported_product_images(product, image_paths)
            if stored_count > 0 and product_image_source:
                register_import_image_source(
                    stats,
                    product_image_states,
                    state_key=str(product.id),
                    prefix="product_images",
                    source=product_image_source,
                )
        elif not product.images.exists():
            register_import_image_source(
                stats,
                product_image_states,
                state_key=str(product.id),
                prefix="product_images",
                source="missing",
            )

        key = "products_created" if result == "created" else "products_updated"
        stats[key] += 1

    return stats


def import_catalog_nodes(
    nodes: list[CatalogImportNode],
    *,
    parent: Category,
    stats: dict[str, int | str],
    lineage: list[str],
    category_image_states: dict[str, str],
    product_image_states: dict[str, str],
) -> None:
    for node in nodes:
        if node.children:
            category_state: str | None = "from_excel" if node.media_urls else None
            image_source = node.media_urls[0] if node.media_urls else (
                autoparse_category_image_source(
                    node.title,
                    parent_title=parent.title,
                    slug=parent.slug,
                )
            )
            if image_source and not node.media_urls:
                category_state = "autoparsed"
            category, created = upsert_category(
                title=node.title,
                parent=parent,
                sort=node.sort,
                image_url=image_source,
            )
            if created:
                stats["categories_created"] += 1
            if category_state:
                register_import_image_source(
                    stats,
                    category_image_states,
                    state_key=str(category.id),
                    prefix="category_images",
                    source=category_state,
                )
            elif not category.image_url:
                register_import_image_source(
                    stats,
                    category_image_states,
                    state_key=str(category.id),
                    prefix="category_images",
                    source="missing",
                )
            import_catalog_nodes(
                node.children,
                parent=category,
                stats=stats,
                lineage=[*lineage, node.title],
                category_image_states=category_image_states,
                product_image_states=product_image_states,
            )
            continue

        description = " / ".join([*lineage, node.title])
        result, product = upsert_product(
            title=node.title,
            category=parent,
            sort=node.sort,
            description=description,
            is_published=True,
        )
        product_image_state: str | None = "from_excel" if node.media_urls else None
        image_sources = node.media_urls or autoparse_product_image_sources(
            title=node.title,
            category_title=parent.title,
            category_slug=parent.slug,
        )
        if image_sources and not node.media_urls:
            product_image_state = "autoparsed"
        if image_sources:
            stored_count = replace_imported_product_images(product, image_sources)
            if stored_count > 0 and product_image_state:
                register_import_image_source(
                    stats,
                    product_image_states,
                    state_key=str(product.id),
                    prefix="product_images",
                    source=product_image_state,
                )
        elif not product.images.exists():
            register_import_image_source(
                stats,
                product_image_states,
                state_key=str(product.id),
                prefix="product_images",
                source="missing",
            )
        key = "products_created" if result == "created" else "products_updated"
        stats[key] += 1


def import_catalog_products(sheets: list[CatalogImportSheet]) -> dict[str, int | str]:
    stats: dict[str, int | str] = {
        "mode": "catalog",
        "categories_created": 0,
        "products_created": 0,
        "products_updated": 0,
        "products_skipped": 0,
    }
    extend_import_stats(stats)
    category_image_states: dict[str, str] = {}
    product_image_states: dict[str, str] = {}

    for index, sheet in enumerate(sheets):
        root_category_image = autoparse_category_image_source(sheet.title)
        root_category, created = upsert_category(
            title=sheet.title,
            parent=None,
            sort=index,
            image_url=root_category_image,
        )
        if created:
            stats["categories_created"] += 1
        if root_category_image:
            register_import_image_source(
                stats,
                category_image_states,
                state_key=str(root_category.id),
                prefix="category_images",
                source="autoparsed",
            )
        elif not root_category.image_url:
            register_import_image_source(
                stats,
                category_image_states,
                state_key=str(root_category.id),
                prefix="category_images",
                source="missing",
            )
        import_catalog_nodes(
            sheet.nodes,
            parent=root_category,
            stats=stats,
            lineage=[sheet.title],
            category_image_states=category_image_states,
            product_image_states=product_image_states,
        )

    return stats


def sync_product_gallery(
    product: Product,
    *,
    keep_image_ids: set[str] | None,
    uploaded_files: list,
) -> None:
    existing_images = list(product.images.all().order_by("sort", "id"))
    kept_images: list[ProductImage] = []

    if keep_image_ids is None:
        kept_images = existing_images
    else:
        for image in existing_images:
            if str(image.id) in keep_image_ids:
                kept_images.append(image)
                continue

            remove_media_file(image.image_path)
            image.delete()

    for sort, image in enumerate(kept_images):
        if image.sort != sort:
            image.sort = sort
            image.save(update_fields=["sort"])

    if not uploaded_files:
        return

    appended_paths = append_product_images(
        str(product.id),
        uploaded_files,
        start_sort=len(kept_images),
    )
    ProductImage.objects.bulk_create(
        [
            ProductImage(product=product, image_path=path, sort=len(kept_images) + index)
            for index, path in enumerate(appended_paths)
        ]
    )


def build_media_import_payload(
    *,
    scope: str,
    mode: str,
    limit: int,
    published_only: bool = False,
) -> dict[str, object]:
    payload: dict[str, object] = {
        "scope": scope,
        "mode": mode,
        "limit": limit,
    }
    if scope == "products":
        payload["published_only"] = published_only
    return payload


def empty_media_import_stats(*, scope: str, mode: str, limit: int, published_only: bool = False) -> dict[str, object]:
    stats = build_media_import_payload(scope=scope, mode=mode, limit=limit, published_only=published_only)
    stats.update(
        {
            "processed": 0,
            "updated": 0,
            "not_found": 0,
            "download_failures": 0,
            "unchanged": 0,
            "updated_titles": [],
        }
    )
    return stats


def autoparse_category_media_batch(*, mode: str, limit: int) -> dict[str, object]:
    queryset = Category.objects.select_related("parent").order_by("parent_id", "sort", "title")
    if mode == "missing":
        queryset = queryset.filter(Q(image_url__isnull=True) | Q(image_url=""))

    rows = list(queryset[:limit])
    stats = empty_media_import_stats(scope="categories", mode=mode, limit=limit)

    for category in rows:
        stats["processed"] = int(stats["processed"]) + 1
        image_source = autoparse_category_image_source(
            category.title,
            parent_title=category.parent.title if category.parent_id else None,
            slug=category.slug,
        )
        if not image_source:
            stats["not_found"] = int(stats["not_found"]) + 1
            continue

        stored_path = materialize_category_image(str(category.id), image_source)
        if not stored_path:
            stats["download_failures"] = int(stats["download_failures"]) + 1
            continue

        if category.image_url == stored_path:
            stats["unchanged"] = int(stats["unchanged"]) + 1
            continue

        category.image_url = stored_path
        category.save(update_fields=["image_url"])
        stats["updated"] = int(stats["updated"]) + 1
        cast_titles = stats["updated_titles"]
        if isinstance(cast_titles, list):
            cast_titles.append(category.title)

    return stats


def autoparse_product_media_batch(*, mode: str, limit: int, published_only: bool = False) -> dict[str, object]:
    queryset = Product.objects.select_related("category").prefetch_related("images").order_by("category_id", "sort", "-created_at")
    if published_only:
        queryset = queryset.filter(is_published=True)
    if mode == "missing":
        queryset = queryset.exclude(id__in=ProductImage.objects.values("product_id"))

    rows = list(queryset[:limit])
    stats = empty_media_import_stats(scope="products", mode=mode, limit=limit, published_only=published_only)

    for product in rows:
        stats["processed"] = int(stats["processed"]) + 1
        image_sources = autoparse_product_image_sources(
            title=product.title,
            sku=product.sku,
            category_title=product.category.title,
            category_slug=product.category.slug,
        )
        if not image_sources:
            stats["not_found"] = int(stats["not_found"]) + 1
            continue

        stored_count = replace_imported_product_images(product, image_sources)
        if stored_count <= 0:
            stats["download_failures"] = int(stats["download_failures"]) + 1
            continue

        stats["updated"] = int(stats["updated"]) + 1
        cast_titles = stats["updated_titles"]
        if isinstance(cast_titles, list):
            cast_titles.append(product.title)

    return stats


@api_view(["GET", "POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminUserCookie])
@parser_classes([MultiPartParser, FormParser])
def admin_products_view(request):
    if request.method == "GET":
        category_id = request.query_params.get("category_id")
        queryset = Product.objects.all().prefetch_related("images").order_by("category_id", "sort", "-created_at")
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return Response([serialize_product(request, product) for product in queryset])

    try:
        product = product_from_request(request)
    except ValueError as exc:
        detail = str(exc)
        status_code = status.HTTP_400_BAD_REQUEST if detail != "CATEGORY_NOT_FOUND" else status.HTTP_404_NOT_FOUND
        return Response({"detail": detail}, status=status_code)

    product.save()
    images = request.FILES.getlist("images")
    if images:
        ProductImage.objects.bulk_create(
            [
                ProductImage(product=product, image_path=path, sort=index)
                for index, path in enumerate(append_product_images(str(product.id), images))
            ]
        )
    product.refresh_from_db()
    return Response(serialize_product(request, product))


@api_view(["GET", "PUT", "DELETE"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminUserCookie])
@parser_classes([MultiPartParser, FormParser])
def admin_product_detail_view(request, product_id):
    product = get_object_or_404(Product.objects.prefetch_related("images"), pk=product_id)

    if request.method == "GET":
        return Response(serialize_product(request, product))

    if request.method == "DELETE":
        remove_product_media(str(product.id))
        product.delete()
        return message_ok()

    try:
        product = product_from_request(request, instance=product)
    except ValueError as exc:
        detail = str(exc)
        status_code = status.HTTP_400_BAD_REQUEST if detail != "CATEGORY_NOT_FOUND" else status.HTTP_404_NOT_FOUND
        return Response({"detail": detail}, status=status_code)

    product.save()
    images = request.FILES.getlist("images")
    keep_image_ids_raw = request.data.getlist("keep_image_ids")
    keep_image_ids = {str(value).strip() for value in keep_image_ids_raw if str(value).strip()}

    if keep_image_ids_raw or images:
        sync_product_gallery(
            product,
            keep_image_ids=keep_image_ids,
            uploaded_files=images,
        )

    product.refresh_from_db()
    return Response(serialize_product(request, product))


@api_view(["PUT"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminUserCookie])
def admin_products_order_view(request):
    serializer = SortSerializer(data=request.data, many=True)
    serializer.is_valid(raise_exception=True)
    mapping = {str(item["id"]): item["sort"] for item in serializer.validated_data}

    rows = Product.objects.filter(id__in=mapping.keys())
    for row in rows:
        row.sort = mapping[str(row.id)]
        row.save(update_fields=["sort", "updated_at"])
    return message_ok()


def orders_queryset():
    return (
        Order.objects.all()
        .prefetch_related(
            Prefetch(
                "items",
                queryset=OrderItem.objects.select_related("product").prefetch_related("product__images"),
            )
        )
        .order_by("-created_at")
    )


def contact_requests_queryset():
    return ContactRequest.objects.annotate(
        status_priority=Case(
            When(status="new", then=0),
            When(status="in_progress", then=1),
            default=2,
            output_field=IntegerField(),
        )
    ).order_by("status_priority", "-created_at")


@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminUserCookie])
def admin_orders_view(request):
    return Response([serialize_order(request, order) for order in orders_queryset()])


@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminUserCookie])
def admin_order_detail_view(request, order_id):
    order = orders_queryset().filter(pk=order_id).first()
    if not order:
        return Response({"detail": "ORDER_NOT_FOUND"}, status=status.HTTP_404_NOT_FOUND)
    return Response(serialize_order(request, order))


@api_view(["PATCH"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminUserCookie])
def admin_order_status_view(request, order_id):
    serializer = OrderStatusSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    next_status = serializer.validated_data["status"].strip().lower()
    if next_status not in ORDER_STATUSES:
        return Response({"detail": "INVALID_ORDER_STATUS"}, status=status.HTTP_400_BAD_REQUEST)

    order = Order.objects.filter(pk=order_id).first()
    if not order:
        return Response({"detail": "ORDER_NOT_FOUND"}, status=status.HTTP_404_NOT_FOUND)

    order.status = next_status
    order.save(update_fields=["status", "updated_at"])
    return message_ok()


@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminUserCookie])
def admin_contact_requests_view(request):
    rows = contact_requests_queryset()
    return Response([serialize_contact_request(request, contact_request) for contact_request in rows])


@api_view(["GET", "DELETE"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminUserCookie])
def admin_contact_request_detail_view(request, contact_request_id):
    contact_request = contact_requests_queryset().filter(pk=contact_request_id).first()
    if not contact_request:
        return Response({"detail": "CONTACT_REQUEST_NOT_FOUND"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "DELETE":
        remove_media_file(contact_request.attachment_path)
        contact_request.delete()
        return message_ok()

    return Response(serialize_contact_request(request, contact_request))


@api_view(["PATCH"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminUserCookie])
def admin_contact_request_status_view(request, contact_request_id):
    serializer = ContactRequestStatusSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    next_status = serializer.validated_data["status"].strip().lower()
    if next_status not in CONTACT_REQUEST_STATUSES:
        return Response({"detail": "INVALID_CONTACT_REQUEST_STATUS"}, status=status.HTTP_400_BAD_REQUEST)

    contact_request = ContactRequest.objects.filter(pk=contact_request_id).first()
    if not contact_request:
        return Response({"detail": "CONTACT_REQUEST_NOT_FOUND"}, status=status.HTTP_404_NOT_FOUND)

    contact_request.status = next_status
    contact_request.save(update_fields=["status", "updated_at"])
    return message_ok()


@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminUserCookie])
@parser_classes([MultiPartParser, FormParser])
def admin_import_products_view(request):
    uploaded_file = request.FILES.get("file")
    if not uploaded_file:
        return Response({"detail": "FILE_REQUIRED"}, status=status.HTTP_400_BAD_REQUEST)

    file_name = (uploaded_file.name or "").lower()
    if not file_name.endswith(".xlsx"):
        return Response({"detail": "INVALID_FILE_FORMAT"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        file_bytes = uploaded_file.read()
        rows = parse_excel_upload(file_bytes)
    except Exception:
        return Response({"detail": "INVALID_EXCEL_FILE"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            if is_flat_excel_import(rows):
                stats = import_flat_products(rows)
            else:
                try:
                    sheets = parse_catalog_excel(file_bytes)
                except Exception:
                    return Response({"detail": "INVALID_EXCEL_STRUCTURE"}, status=status.HTTP_400_BAD_REQUEST)

                if not sheets:
                    return Response({"detail": "EMPTY_IMPORT_FILE"}, status=status.HTTP_400_BAD_REQUEST)

                stats = import_catalog_products(sheets)
    except Exception as exc:
        return Response(
            {
                "detail": "IMPORT_FAILED",
                "error": str(exc) or exc.__class__.__name__,
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return Response({"message": "OK", "stats": stats})


@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminUserCookie])
@parser_classes([JSONParser])
def admin_media_import_categories_view(request):
    serializer = MediaAutoparseSerializer(data=request.data or {})
    serializer.is_valid(raise_exception=True)

    mode = serializer.validated_data["mode"]
    limit = serializer.validated_data["limit"]
    stats = autoparse_category_media_batch(mode=mode, limit=limit)
    return Response({"message": "OK", "stats": stats})


@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminUserCookie])
@parser_classes([JSONParser])
def admin_media_import_products_view(request):
    serializer = MediaAutoparseSerializer(data=request.data or {})
    serializer.is_valid(raise_exception=True)

    mode = serializer.validated_data["mode"]
    limit = serializer.validated_data["limit"]
    published_only = serializer.validated_data["published_only"]
    stats = autoparse_product_media_batch(
        mode=mode,
        limit=limit,
        published_only=published_only,
    )
    return Response({"message": "OK", "stats": stats})
