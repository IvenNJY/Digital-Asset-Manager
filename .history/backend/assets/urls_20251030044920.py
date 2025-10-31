# assets/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Asset CRUD
    path("assets/", views.asset_list_view, name="asset-list"),
    path("assets/upload/", views.upload_asset_view, name="upload-asset"),
    path("assets/<int:asset_id>/", views.update_asset_view, name="update-asset"),
    
    # Versioning
    path("assets/<int:asset_id>/upload-version/", views.upload_version_view, name="upload-version"),
    path("assets/<int:asset_id>/versions/", views.asset_versions_view, name="asset-versions"),

    # Metadata
    path("assets/<int:asset_id>/metadata/", views.asset_metadata_view, name="asset-metadata"),

    # Tags
    path("assets/<int:asset_id>/tags/", views.asset_tags_view, name="asset-tags"),
    path("assets/<int:asset_id>/tags/add/", views.add_tag_view, name="add-tag"),
    path("assets/<int:asset_id>/tags/remove/", views.remove_tag_view, name="remove-tag"),
]