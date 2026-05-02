import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    operations = [
        migrations.CreateModel(
            name="Category",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("slug", models.CharField(db_index=True, max_length=255, unique=True)),
                ("title", models.CharField(max_length=255)),
                ("image_url", models.TextField(blank=True, null=True)),
                ("sort", models.IntegerField(default=0)),
                (
                    "parent",
                    models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="children", to="shop.category"),
                ),
            ],
            options={"ordering": ["sort", "title"]},
        ),
        migrations.CreateModel(
            name="User",
            fields=[
                ("password", models.CharField(max_length=128, verbose_name="password")),
                ("last_login", models.DateTimeField(blank=True, null=True, verbose_name="last login")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("email", models.EmailField(db_index=True, max_length=254, unique=True)),
                ("full_name", models.CharField(blank=True, max_length=255, null=True)),
                ("phone", models.CharField(blank=True, max_length=64, null=True)),
                ("is_admin", models.BooleanField(default=False)),
                ("is_staff", models.BooleanField(default=False)),
                ("is_active", models.BooleanField(default=True)),
                ("groups", models.ManyToManyField(blank=True, related_name="user_set", related_query_name="user", to="auth.group", verbose_name="groups")),
                ("user_permissions", models.ManyToManyField(blank=True, related_name="user_set", related_query_name="user", to="auth.permission", verbose_name="user permissions")),
            ],
            options={"abstract": False},
        ),
        migrations.CreateModel(
            name="Cart",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("status", models.CharField(choices=[("active", "active"), ("ordered", "ordered")], db_index=True, default="active", max_length=32)),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="carts", to="shop.user")),
            ],
        ),
        migrations.CreateModel(
            name="Order",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("ticket_number", models.CharField(db_index=True, max_length=64, unique=True)),
                ("status", models.CharField(choices=[("new", "new"), ("processing", "processing"), ("completed", "completed"), ("cancelled", "cancelled")], default="new", max_length=32)),
                ("customer_name", models.CharField(blank=True, max_length=255, null=True)),
                ("customer_email", models.EmailField(max_length=254)),
                ("customer_phone", models.CharField(blank=True, max_length=64, null=True)),
                ("comment", models.TextField(blank=True, null=True)),
                ("total_items", models.IntegerField(default=0)),
                ("total_price", models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True)),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="orders", to="shop.user")),
            ],
        ),
        migrations.CreateModel(
            name="Product",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("slug", models.CharField(db_index=True, max_length=255, unique=True)),
                ("title", models.CharField(max_length=255)),
                ("sku", models.CharField(blank=True, max_length=255, null=True, unique=True)),
                ("price", models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True)),
                ("thickness", models.DecimalField(blank=True, decimal_places=2, max_digits=6, null=True)),
                ("color", models.CharField(blank=True, max_length=255, null=True)),
                ("material", models.CharField(blank=True, max_length=255, null=True)),
                ("description", models.TextField(blank=True, null=True)),
                ("is_published", models.BooleanField(default=True)),
                ("sort", models.IntegerField(default=0)),
                ("category", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="products", to="shop.category")),
            ],
            options={"ordering": ["sort", "-created_at"]},
        ),
        migrations.CreateModel(
            name="ProductImage",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("image_path", models.TextField()),
                ("sort", models.IntegerField(default=0)),
                ("product", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="images", to="shop.product")),
            ],
            options={"ordering": ["sort"]},
        ),
        migrations.CreateModel(
            name="OrderItem",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("quantity", models.IntegerField(default=1)),
                ("price", models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True)),
                ("title_snapshot", models.CharField(max_length=255)),
                ("order", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="items", to="shop.order")),
                ("product", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="order_items", to="shop.product")),
            ],
        ),
        migrations.CreateModel(
            name="CartItem",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("quantity", models.IntegerField(default=1)),
                ("cart", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="items", to="shop.cart")),
                ("product", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="cart_items", to="shop.product")),
            ],
        ),
        migrations.AddIndex(
            model_name="cart",
            index=models.Index(fields=["user", "status"], name="shop_cart_user_id_0b7667_idx"),
        ),
        migrations.AddConstraint(
            model_name="cartitem",
            constraint=models.UniqueConstraint(fields=("cart", "product"), name="uq_shop_cartitem_cart_product"),
        ),
    ]
