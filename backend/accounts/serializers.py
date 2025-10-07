from django.contrib.auth import get_user_model
from rest_framework import serializers
from accounts.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['user_id', 'username', 'email', 'role', 'created_at', 'last_login']


class AuthUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff']