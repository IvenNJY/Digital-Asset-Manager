# assets/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("upload/", views.upload_asset_view, name="upload-asset"),
    path("list/", views.asset_list_view, name="asset-list"),
    path("<int:asset_id>/upload-version/", views.upload_version_view, name="upload-version"),
    path("<int:asset_id>/add-tag/", views.add_tag_view, name="add-tag"),
    path("<int:asset_id>/remove-tag/", views.remove_tag_view, name="remove-tag"),
]
