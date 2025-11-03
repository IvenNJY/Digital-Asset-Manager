# assets/admin.py
from django.contrib import admin
from .models import (
    Folder,
    Asset,
    Version,
    Tag,
    AssetTag,
    MetadataField,
    AssetMetadata,
)


@admin.register(Folder)
class FolderAdmin(admin.ModelAdmin):
    list_display = ("folder_id", "name", "parent_folder", "created_by", "created_at")
    search_fields = ("name",)
    list_filter = ("created_by",)


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ("asset_id", "name", "asset_type", "folder", "uploaded_by", "uploaded_at", "size_bytes")
    search_fields = ("name", "file_path")
    list_filter = ("asset_type", "uploaded_by")


@admin.register(Version)
class VersionAdmin(admin.ModelAdmin):
    list_display = ("version_id", "asset", "version_number", "uploaded_by", "uploaded_at")
    search_fields = ("asset__name",)


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("tag_id", "name")
    search_fields = ("name",)


@admin.register(AssetTag)
class AssetTagAdmin(admin.ModelAdmin):
    list_display = ("asset", "tag")


@admin.register(MetadataField)
class MetadataFieldAdmin(admin.ModelAdmin):
    list_display = ("field_id", "name", "data_type", "created_by")
    search_fields = ("name",)
    list_filter = ("data_type",)


@admin.register(AssetMetadata)
class AssetMetadataAdmin(admin.ModelAdmin):
    list_display = ("asset", "field", "value")
    search_fields = ("asset__name", "field__name")
