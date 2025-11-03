# assets/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Folder,
    Asset,
    Version,
    Tag,
    AssetTag,
    MetadataField,
    AssetMetadata,
    AssetFolder,
)

User = get_user_model()


# -----------------------------
# Folder Serializer
# -----------------------------
class FolderSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField(read_only=True)
    subfolders = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Folder
        fields = [
            "folder_id",
            "name",
            "parent_folder",
            "created_by",
            "created_at",
            "description",
            "subfolders",
        ]


# -----------------------------
# Tag Serializer
# -----------------------------
class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["tag_id", "name"]


# -----------------------------
# MetadataField Serializer
# -----------------------------
class MetadataFieldSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = MetadataField
        fields = ["field_id", "name", "data_type", "created_by"]


# -----------------------------
# AssetMetadata Serializer
# -----------------------------
class AssetMetadataSerializer(serializers.ModelSerializer):
    field_name = serializers.CharField(source="field.name", read_only=True)
    data_type = serializers.CharField(source="field.data_type", read_only=True)

    class Meta:
        model = AssetMetadata
        fields = ["asset", "field", "field_name", "data_type", "value"]

    def validate(self, attrs):
        """Validate that 'value' matches the data_type in the MetadataField."""
        field = attrs.get("field") or getattr(self.instance, "field", None)
        value = attrs.get("value")

        if not field:
            return attrs  # skip validation if field not resolved yet

        if field.data_type == "integer":
            try:
                int(value)
            except ValueError:
                raise serializers.ValidationError(
                    {"value": "Must be an integer value."}
                )
        elif field.data_type == "float":
            try:
                float(value)
            except ValueError:
                raise serializers.ValidationError(
                    {"value": "Must be a float value."}
                )
        elif field.data_type == "boolean":
            if str(value).lower() not in ["true", "false", "1", "0"]:
                raise serializers.ValidationError(
                    {"value": "Must be a boolean value (true/false)."}
                )
        elif field.data_type == "date":
            try:
                serializers.DateField().to_internal_value(value)
            except Exception:
                raise serializers.ValidationError(
                    {"value": "Must be a valid date (YYYY-MM-DD)."}
                )
        # strings are always fine

        return attrs


# -----------------------------
# Version Serializer
# -----------------------------
class VersionSerializer(serializers.ModelSerializer):
    uploaded_by = serializers.StringRelatedField(read_only=True)
    asset_name = serializers.CharField(source="asset.name", read_only=True)


    #file upload support for versions
    upload_file = serializers.FileField(write_only=True, required=False)
    snapshot = serializers.JSONField(read_only=True)  # ← MUST BE HERE

    class Meta:
        model = Version
        fields = [
            "version_id",
            "asset",
            "asset_name",
            "version_number",
            "file_path",
            "uploaded_by",
            "uploaded_at",
            "changes_note",
            "upload_file",
            "snapshot",  # ← MUST BE HERE
        ]
        read_only_fields = ["uploaded_by", "uploaded_at", "file_path"] 


# -----------------------------
# Asset Serializer (UPDATED)
# -----------------------------
class AssetSerializer(serializers.ModelSerializer):
    uploaded_by = serializers.StringRelatedField(read_only=True)

    # NEW: list of folders from the junction table
    folders = AssetFolderSerializer(source="folder_mappings", many=True, read_only=True)

    current_version_info = VersionSerializer(source="current_version", read_only=True)
    metadata = AssetMetadataSerializer(many=True, read_only=True)
    tags = serializers.SerializerMethodField()

    # File upload
    upload_file = serializers.FileField(write_only=True, required=False)

    class Meta:
        model = Asset
        fields = [
            "asset_id",
            "name",
            "asset_type",
            "upload_file",
            "file_path",
            "folders",                     # <-- NEW
            "uploaded_by",
            "uploaded_at",
            "size_bytes",
            "description",
            "current_version",
            "current_version_info",
            "metadata",
            "tags",
        ]
        read_only_fields = ["uploaded_by", "uploaded_at", "file_path", "size_bytes"]

    def get_tags(self, obj):
        return [t.tag.name for t in obj.asset_tags.all()]

    def create(self, validated_data):
        validated_data["uploaded_by"] = self.context["request"].user
        return super().create(validated_data)


# -----------------------------
# AssetTag Serializer
# -----------------------------
class AssetTagSerializer(serializers.ModelSerializer):
    asset_name = serializers.CharField(source="asset.name", read_only=True)
    tag_name = serializers.CharField(source="tag.name", read_only=True)

    class Meta:
        model = AssetTag
        fields = ["asset", "tag", "asset_name", "tag_name"]
# -----------------------------
# AssetFolder Serializer (NEW)
# -----------------------------
class AssetFolderSerializer(serializers.ModelSerializer):
    folder_name = serializers.CharField(source="folder.name", read_only=True)

    class Meta:
        model = AssetFolder
        fields = ["folder", "folder_name"]