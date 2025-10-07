from django.shortcuts import render

# Create your views here.
from rest_framework import generics
from accounts.models import User
from accounts.serializers import UserSerializer

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer