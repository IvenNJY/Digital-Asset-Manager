from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('assets', '0004_merge_20251101_1323'),
    ]

    operations = [
        migrations.RemoveIndex(
            model_name='version',
            name='versions_snapshot_gin_idx',
        ),
    ]