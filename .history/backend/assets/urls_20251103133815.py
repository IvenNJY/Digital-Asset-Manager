# assets/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Asset CRUD
    path("list/", views.asset_list_view, name="asset-list"),
    path("upload/", views.upload_asset_view, name="upload-asset"),
    path("summary/", views.asset_summary_view, name="asset-summary"),
    path("<int:asset_id>/", views.update_asset_view, name="update-asset"),
    path("assets/<int:asset_id>/", views.delete_asset_view, name="delete-asset"),

    # Versioning
    path("<int:asset_id>/upload-version/", views.upload_version_view, name="upload-version"),
    path("<int:asset_id>/versions/", views.asset_versions_view, name="asset-versions"),

    # Metadata
    path("<int:asset_id>/metadata/", views.asset_metadata_view, name="asset-metadata"),

    # Tags
    path("<int:asset_id>/tags/", views.asset_tags_view, name="asset-tags"),
    path("<int:asset_id>/tags/add/", views.add_tag_view, name="add-tag"),
    path("<int:asset_id>/tags/remove/", views.remove_tag_view, name="remove-tag"),

    #Folder
    path("folders/", views.folder_list_view, name="folder-list"),
]