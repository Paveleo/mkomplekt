from __future__ import annotations

import uuid

from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email: str, password: str | None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email).lower()
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email: str, password: str | None = None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        extra_fields.setdefault("is_admin", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email: str, password: str | None = None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_admin", True)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        if extra_fields.get("is_admin") is not True:
            raise ValueError("Superuser must have is_admin=True.")
        return self._create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin, TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    full_name = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=64, unique=True, blank=True, null=True)
    district = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=255, blank=True, null=True)
    is_admin = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []

    def __str__(self) -> str:
        return self.email


class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.CharField(max_length=255, unique=True, db_index=True)
    title = models.CharField(max_length=255)
    parent = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="children",
    )
    image_url = models.TextField(blank=True, null=True)
    sort = models.IntegerField(default=0)

    class Meta:
        ordering = ["sort", "title"]

    def __str__(self) -> str:
        return self.title


class Product(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.CharField(max_length=255, unique=True, db_index=True)
    title = models.CharField(max_length=255)
    sku = models.CharField(max_length=255, unique=True, blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="products")
    price = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    size = models.CharField(max_length=255, blank=True, null=True)
    thickness = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    color = models.CharField(max_length=255, blank=True, null=True)
    unit = models.CharField(max_length=64, blank=True, null=True)
    material = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    is_published = models.BooleanField(default=True)
    sort = models.IntegerField(default=0)

    class Meta:
        ordering = ["sort", "-created_at"]

    def __str__(self) -> str:
        return self.title


class ProductImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image_path = models.TextField()
    sort = models.IntegerField(default=0)

    class Meta:
        ordering = ["sort"]


class Review(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    city = models.CharField(max_length=255, blank=True, null=True)
    role = models.CharField(max_length=255, blank=True, null=True, default="Клиент")
    body = models.TextField()
    avatar_path = models.TextField(blank=True, null=True)
    image_path = models.TextField(blank=True, null=True)
    is_published = models.BooleanField(default=True)
    sort = models.IntegerField(default=0)

    class Meta:
        ordering = ["sort", "-created_at"]

    def __str__(self) -> str:
        return self.name


class ContactRequest(TimeStampedModel):
    STATUS_CHOICES = [
        ("new", "new"),
        ("in_progress", "in_progress"),
        ("done", "done"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=64, blank=True, null=True)
    message = models.TextField(blank=True, null=True)
    attachment_path = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default="new", db_index=True)

    class Meta:
        ordering = ["status", "-created_at"]

    def __str__(self) -> str:
        return self.name


class Cart(TimeStampedModel):
    STATUS_CHOICES = [
        ("active", "active"),
        ("ordered", "ordered"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="carts")
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default="active", db_index=True)

    class Meta:
        indexes = [
            models.Index(fields=["user", "status"]),
        ]


class CartItem(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="cart_items")
    quantity = models.IntegerField(default=1)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["cart", "product"], name="uq_shop_cartitem_cart_product"),
        ]


class Order(TimeStampedModel):
    STATUS_CHOICES = [
        ("new", "new"),
        ("processing", "processing"),
        ("completed", "completed"),
        ("cancelled", "cancelled"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket_number = models.CharField(max_length=64, unique=True, db_index=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders")
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default="new")
    customer_name = models.CharField(max_length=255, blank=True, null=True)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=64, blank=True, null=True)
    comment = models.TextField(blank=True, null=True)
    total_items = models.IntegerField(default=0)
    total_price = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)


class OrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="order_items",
    )
    quantity = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    title_snapshot = models.CharField(max_length=255)
