import re

from rest_framework import serializers


SAKHA_DISTRICTS = {
    "Абыйский район",
    "Алданский район",
    "Аллаиховский район",
    "Амгинский район",
    "Анабарский улус",
    "Булунский улус",
    "Верхневилюйский улус",
    "Верхнеколымский улус",
    "Верхоянский район",
    "Вилюйский улус",
    "Горный улус",
    "Жиганский улус",
    "Кобяйский улус",
    "Ленский район",
    "Мегино-Кангаласский улус",
    "Мирнинский район",
    "Момский район",
    "Намский улус",
    "Нерюнгринский район",
    "Нижнеколымский район",
    "Нюрбинский район",
    "Оймяконский улус",
    "Оленекский эвенкийский национальный район",
    "Олекминский район",
    "Среднеколымский улус",
    "Сунтарский улус",
    "Таттинский улус",
    "Томпонский район",
    "Усть-Алданский улус",
    "Усть-Майский улус",
    "Усть-Янский улус",
    "Хангаласский улус",
    "Чурапчинский улус",
    "Эвено-Бытантайский национальный улус",
    "Городской округ Якутск",
    "Городской округ Жатай",
}


def normalize_ru_mobile_phone(value: str | None) -> str:
    raw = str(value or "").strip()
    digits = re.sub(r"\D+", "", raw)
    if len(digits) == 11 and digits.startswith("8"):
        digits = f"7{digits[1:]}"
    elif len(digits) == 10:
        digits = f"7{digits}"

    if len(digits) != 11 or not digits.startswith("79"):
        raise serializers.ValidationError({"detail": "INVALID_PHONE"})
    if len(set(digits[-10:])) < 3:
        raise serializers.ValidationError({"detail": "INVALID_PHONE"})
    return f"+{digits}"


def validate_sakha_district(value: str | None) -> str:
    district = str(value or "").strip()
    if district not in SAKHA_DISTRICTS:
        raise serializers.ValidationError({"detail": "INVALID_DISTRICT"})
    return district


def normalize_required_text(value: str | None, error_code: str) -> str:
    normalized = " ".join(str(value or "").strip().split())
    if not normalized:
        raise serializers.ValidationError({"detail": error_code})
    return normalized


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class RegisterSerializer(LoginSerializer):
    full_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    phone = serializers.CharField()
    district = serializers.CharField()
    city = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate(self, attrs):
        if len(str(attrs.get("password") or "")) < 6:
            raise serializers.ValidationError({"detail": "PASSWORD_TOO_SHORT"})
        attrs["phone"] = normalize_ru_mobile_phone(attrs.get("phone"))
        attrs["district"] = validate_sakha_district(attrs.get("district"))
        attrs["city"] = str(attrs.get("city") or "").strip() or None
        attrs["full_name"] = normalize_required_text(attrs.get("full_name"), "FULL_NAME_REQUIRED")
        return attrs


class UserPublicSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    email = serializers.EmailField()
    full_name = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    phone = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    district = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    city = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    is_admin = serializers.BooleanField()


class ProfileUpdateSerializer(serializers.Serializer):
    full_name = serializers.CharField()
    phone = serializers.CharField()
    district = serializers.CharField()
    city = serializers.CharField()

    def validate(self, attrs):
        attrs["full_name"] = normalize_required_text(attrs.get("full_name"), "FULL_NAME_REQUIRED")
        attrs["phone"] = normalize_ru_mobile_phone(attrs.get("phone"))
        attrs["district"] = validate_sakha_district(attrs.get("district"))
        attrs["city"] = normalize_required_text(attrs.get("city"), "CITY_REQUIRED")
        return attrs


class CartItemCreateSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1, default=1)


class CartItemUpdateSerializer(serializers.Serializer):
    quantity = serializers.IntegerField()


class CreateOrderSerializer(serializers.Serializer):
    comment = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class CategoryPayloadSerializer(serializers.Serializer):
    title = serializers.CharField()
    parent_id = serializers.UUIDField(required=False, allow_null=True)
    image_url = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    is_visible = serializers.BooleanField(required=False)
    slug = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    sort = serializers.IntegerField(required=False, allow_null=True)


class ReviewPayloadSerializer(serializers.Serializer):
    name = serializers.CharField()
    city = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    role = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    body = serializers.CharField()
    is_published = serializers.BooleanField(required=False)
    sort = serializers.IntegerField(required=False, allow_null=True)
    remove_avatar = serializers.BooleanField(required=False)
    remove_image = serializers.BooleanField(required=False)


class WorkPayloadSerializer(serializers.Serializer):
    title = serializers.CharField()
    caption = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    image_url = serializers.URLField()
    source_url = serializers.URLField(required=False, allow_blank=True, allow_null=True)
    is_published = serializers.BooleanField(required=False)
    sort = serializers.IntegerField(required=False, allow_null=True)


class InstagramWorkImportSerializer(serializers.Serializer):
    source_url = serializers.URLField()
    limit = serializers.IntegerField(required=False, min_value=1, max_value=50, default=12)


class TwoGisReviewImportSerializer(serializers.Serializer):
    source_url = serializers.URLField()
    limit = serializers.IntegerField(required=False, min_value=1, max_value=500)



    def validate(self, attrs):
        image_url = attrs.get("image_url")
        image_urls = attrs.get("image_urls") or []
        if not image_url and not image_urls:
            raise serializers.ValidationError({"detail": "IMAGE_URL_REQUIRED"})
        return attrs


class SortSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    sort = serializers.IntegerField()


class OrderStatusSerializer(serializers.Serializer):
    status = serializers.CharField()


class ContactRequestCreateSerializer(serializers.Serializer):
    name = serializers.CharField()
    email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    phone = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    message = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate(self, attrs):
        name = (attrs.get("name") or "").strip()
        if not name:
            raise serializers.ValidationError({"detail": "NAME_REQUIRED"})
        email = (attrs.get("email") or "").strip()
        phone = (attrs.get("phone") or "").strip()
        if not email and not phone:
            raise serializers.ValidationError({"detail": "EMAIL_OR_PHONE_REQUIRED"})
        attrs["email"] = email or None
        attrs["phone"] = phone or None
        attrs["message"] = (attrs.get("message") or "").strip() or None
        attrs["name"] = name
        return attrs


class ContactRequestStatusSerializer(serializers.Serializer):
    status = serializers.CharField()
