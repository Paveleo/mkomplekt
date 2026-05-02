from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("shop", "0004_contactrequest"),
    ]

    operations = [
        migrations.AddField(
            model_name="contactrequest",
            name="attachment_path",
            field=models.TextField(blank=True, null=True),
        ),
    ]
