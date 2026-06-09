from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("shop", "0006_user_location_phone_unique"),
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="size",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name="product",
            name="unit",
            field=models.CharField(blank=True, max_length=64, null=True),
        ),
    ]
