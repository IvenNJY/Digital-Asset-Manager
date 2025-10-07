from django.core.management.base import BaseCommand
from accounts.models import User  # Changed from dam.models to accounts.models

class Command(BaseCommand):
    help = 'Seeds the database with sample users'

    def handle(self, *args, **kwargs):
        users = [
            {'username': 'admin1', 'password_hash': 'bcrypt_hash_placeholder1', 'email': 'admin1@example.com', 'role': 'Admin'},
            {'username': 'editor1', 'password_hash': 'bcrypt_hash_placeholder2', 'email': 'editor1@example.com', 'role': 'Editor'},
            {'username': 'viewer1', 'password_hash': 'bcrypt_hash_placeholder3', 'email': 'viewer1@example.com', 'role': 'Viewer'},
        ]

        for user_data in users:
            if not User.objects.filter(username=user_data['username']).exists():
                User.objects.create(**user_data)
                self.stdout.write(self.style.SUCCESS(f"Created user: {user_data['username']}"))
            else:
                self.stdout.write(self.style.WARNING(f"User {user_data['username']} already exists"))