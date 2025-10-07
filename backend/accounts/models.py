from django.db import models

class User(models.Model):
    user_id = models.AutoField(primary_key=True)  # Explicitly define user_id as PK
    username = models.CharField(max_length=50, unique=True)
    password_hash = models.CharField(max_length=255)
    email = models.EmailField(max_length=100, unique=True)
    role = models.CharField(max_length=20, choices=[('Admin', 'Admin'), ('Editor', 'Editor'), ('Viewer', 'Viewer')])
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.username