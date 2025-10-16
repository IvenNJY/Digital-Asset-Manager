from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    run_sql = """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM pg_indexes
                WHERE schemaname = 'public'
                  AND tablename = 'auth_user'
                  AND indexname = 'auth_user_email_unique_idx'
            ) THEN
                CREATE UNIQUE INDEX auth_user_email_unique_idx
                ON auth_user (LOWER(email));
            END IF;
        END;
        $$;
    """

    reverse_sql = "DROP INDEX IF EXISTS auth_user_email_unique_idx;"

    operations = [
        migrations.RunSQL(run_sql, reverse_sql, elidable=False),
    ]

    atomic = False
