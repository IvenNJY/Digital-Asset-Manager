from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('assets', '0002_asset_upload_file_version_upload_file'),
    ]

    operations = [
        migrations.AddField(
            model_name='version',
            name='snapshot',
            field=models.JSONField(blank=True, null=True),
        ),

    ]
