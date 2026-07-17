from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("shop", "0008_work"),
    ]

    operations = [
        migrations.AddField(
            model_name="category",
            name="is_visible",
            field=models.BooleanField(default=True),
        ),
    ]
