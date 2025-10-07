from django.urls import path

from accounts.views import LoginView, PrivateView, RefreshTokenView, UserListView


urlpatterns = [
    path('api/login/', LoginView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', RefreshTokenView.as_view(), name='token_refresh'),
    path('api/users/', UserListView.as_view(), name='user-list'),
    path('api/private/', PrivateView.as_view(), name='private_view'),
]