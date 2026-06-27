import uuid

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("shop", "0007_product_size_unit"),
    ]

    operations = [
        migrations.CreateModel(
            name="Work",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("title", models.CharField(max_length=255)),
                ("caption", models.TextField(blank=True, null=True)),
                ("image_url", models.TextField()),
                ("source_url", models.TextField(blank=True, null=True)),
                ("is_published", models.BooleanField(default=True)),
                ("sort", models.IntegerField(default=0)),
            ],
            options={
                "ordering": ["sort", "-created_at"],
            },
        ),
    ]
