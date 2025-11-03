from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('assets', '0005_remove_version_versions_snapshot_gin_idx'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='version',
            name='snapshot',
        ),
    ]
