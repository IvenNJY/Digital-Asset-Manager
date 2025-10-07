from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand

from accounts.models import User


class Command(BaseCommand):
    help = (
        "Seeds both the Django auth user table and the legacy accounts_user table "
        "with sample credentials"
    )

    DEFAULT_PASSWORDS = {
        "Admin": "AdminPass123!",
        "Editor": "EditorPass123!",
        "Viewer": "ViewerPass123!",
    }

    def handle(self, *args, **kwargs):
        auth_user_model = get_user_model()

        seeds = [
            {
                "username": "admin1",
                "email": "admin1@example.com",
                "role": "Admin",
            },
            {
                "username": "editor1",
                "email": "editor1@example.com",
                "role": "Editor",
            },
            {
                "username": "viewer1",
                "email": "viewer1@example.com",
                "role": "Viewer",
            },
        ]

        for seed in seeds:
            username = seed["username"]
            role = seed["role"]
            password = self.DEFAULT_PASSWORDS[role]

            user_obj, created = auth_user_model.objects.get_or_create(
                username=username,
                defaults={
                    "email": seed["email"],
                    "is_active": True,
                },
            )

            if created:
                user_obj.set_password(password)
                if role == "Admin":
                    user_obj.is_staff = True
                    user_obj.is_superuser = True
                user_obj.save()
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Created Django user '{username}' with password '{password}'"
                    )
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f"Django user '{username}' already exists")
                )

            account_defaults = {
                "password_hash": make_password(password),
                "email": seed["email"],
                "role": seed["role"],
            }

            account_obj, account_created = User.objects.update_or_create(
                username=username,
                defaults=account_defaults,
            )

            if account_created:
                self.stdout.write(
                    self.style.SUCCESS(f"Created accounts.User entry for '{username}'")
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f"Updated accounts.User entry for '{username}'")
                )

        self.stdout.write(
            self.style.SUCCESS(
                "Seeding complete. Use the printed credentials to log into the API."
            )
        )