from django.db import migrations, models


def clear_blank_user_phones(apps, schema_editor):
    user_model = apps.get_model("shop", "User")
    user_model.objects.filter(phone="").update(phone=None)


class Migration(migrations.Migration):
    dependencies = [
        ("shop", "0005_contactrequest_attachment_path"),
    ]

    operations = [
        migrations.RunPython(clear_blank_user_phones, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="user",
            name="phone",
            field=models.CharField(blank=True, max_length=64, null=True, unique=True),
        ),
        migrations.AddField(
            model_name="user",
            name="district",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name="user",
            name="city",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
