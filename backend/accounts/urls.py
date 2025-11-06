from django.urls import path

from . import views


app_name = "accounts"


urlpatterns = [
	path("login/", views.login_view, name="login"),
	path("logout/", views.logout_view, name="logout"),
	path("me/", views.current_user_view, name="current-user"),
    path("users/", views.user_list_view, name="user-list"),
    path("create-user/", views.create_user_view, name="create-user"),
    path("update-user/<int:user_id>/", views.update_user_view, name="update-user"),
    path("delete-user/<int:user_id>/", views.delete_user_view, name="delete-user"),
]
