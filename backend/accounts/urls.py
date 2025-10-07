from django.urls import path
from accounts.views import UserListView

urlpatterns = [
    path('api/users/', UserListView.as_view(), name='user-list'),
]