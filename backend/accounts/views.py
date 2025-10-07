from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from accounts.models import User
from accounts.serializers import AuthUserSerializer, UserSerializer


class LoginView(TokenObtainPairView):
    permission_classes = (permissions.AllowAny,)


class RefreshTokenView(TokenRefreshView):
    permission_classes = (permissions.AllowAny,)


class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class PrivateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = AuthUserSerializer(request.user)
        return Response({
            "message": "Authenticated access granted.",
            "user": serializer.data,
        })