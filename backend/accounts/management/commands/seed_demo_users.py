from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Seed demo users for admin, editor, and viewer roles."

    demo_users = (
        {
            "username": "admin_user",
            "email": "admin@example.com",
            "role": "admin",
            "password": "DemoPass123",
        },
        {
            "username": "editor_user",
            "email": "editor@example.com",
            "role": "editor",
            "password": "DemoPass123",
        },
        {
            "username": "viewer_user",
            "email": "viewer@example.com",
            "role": "viewer",
            "password": "DemoPass123",
        },
    )

    def handle(self, *args, **options):
        user_model = get_user_model()

        for role_name in {entry["role"] for entry in self.demo_users}:
            Group.objects.get_or_create(name=role_name)

        created_users = []
        updated_users = []

        for entry in self.demo_users:
            email = entry["email"].lower()
            role = Group.objects.get(name=entry["role"])
            user = user_model.objects.filter(email__iexact=email).first()

            if user:
                created = False
            else:
                user, created = user_model.objects.get_or_create(
                    username=entry["username"],
                    defaults={"email": email},
                )

            if created:
                user.set_password(entry["password"])
                created_users.append(user.username)
            else:
                user.username = entry["username"]
                user.email = email
                if not user.check_password(entry["password"]):
                    user.set_password(entry["password"])
                updated_users.append(user.username)

            user.save()
            user.groups.clear()
            user.groups.add(role)

        if created_users:
            self.stdout.write(self.style.SUCCESS(f"Created users: {', '.join(created_users)}"))
        if updated_users:
            self.stdout.write(self.style.WARNING(f"Updated users: {', '.join(updated_users)}"))
        if not created_users and not updated_users:
            self.stdout.write("No changes applied.")
