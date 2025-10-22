from django.db import transaction, models
from rest_framework import viewsets, status
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import (
    Folder,
    Asset,
    Version,
    Tag,
    AssetTag,
    MetadataField,
    AssetMetadata,
)
from .serializers import (
    FolderSerializer,
    AssetSerializer,
    VersionSerializer,
    TagSerializer,
    AssetTagSerializer,
    MetadataFieldSerializer,
    AssetMetadataSerializer,
)
from .permissions import IsAdminOrEditor


# -----------------------------
# Folder ViewSet
# -----------------------------
class FolderViewSet(viewsets.ModelViewSet):
    queryset = Folder.objects.select_related("created_by", "parent_folder").all()
    serializer_class = FolderSerializer
    permission_classes = [IsAdminOrEditor]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


# -----------------------------
# Tag ViewSet
# -----------------------------
class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAdminOrEditor]


# -----------------------------
# Metadata Field ViewSet
# -----------------------------
class MetadataFieldViewSet(viewsets.ModelViewSet):
    queryset = MetadataField.objects.select_related("created_by").all()
    serializer_class = MetadataFieldSerializer
    permission_classes = [IsAdminOrEditor]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


# -----------------------------
#  Asset ViewSet 
# -----------------------------
@method_decorator(csrf_exempt, name='dispatch')
class AssetViewSet(viewsets.ModelViewSet):
    queryset = (
        Asset.objects.select_related("uploaded_by", "folder", "current_version")
        .prefetch_related("asset_tags__tag", "metadata__field")
        .all()
    )
    serializer_class = AssetSerializer
    permission_classes = [IsAdminOrEditor]

    def perform_create(self, serializer):
        """Automatically assign uploader."""
        serializer.save(uploaded_by=self.request.user)

    def create(self, request, *args, **kwargs):
        """
         Handles uploading a new asset (Admin/Editor only).
        Accepts multipart/form-data with fields:
        - name
        - asset_type
        - upload_file (actual file)
        - folder (optional)
        - description (optional)
        - tags (optional, comma-separated string)
        """
        upload_file = request.FILES.get("upload_file")
        if not upload_file:
            return Response(
                {"detail": "upload_file is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            asset = serializer.save(uploaded_by=request.user)

            # Store file info in asset fields
            asset.file_path = asset.upload_file.name
            asset.size_bytes = upload_file.size
            asset.save()

            # Create initial version automatically (v1)
            version = Version.objects.create(
                asset=asset,
                version_number=1,
                file_path=asset.file_path,
                uploaded_by=request.user,
                changes_note="Initial upload",
            )

            asset.current_version = version
            asset.save(update_fields=["current_version"])

            # Handle tags (comma-separated from frontend)
            tags_str = request.data.get("tags")
            if tags_str:
                tag_names = [t.strip() for t in tags_str.split(',') if t.strip()]
                for name in tag_names:
                    tag, _ = Tag.objects.get_or_create(name=name)
                    AssetTag.objects.get_or_create(asset=asset, tag=tag)

            return Response(
                AssetSerializer(asset, context={"request": request}).data,
                status=status.HTTP_201_CREATED,
            )

    @action(detail=True, methods=["post"], url_path="add-tag")
    def add_tag(self, request, pk=None):
        """Attach a tag to an asset."""
        asset = self.get_object()
        tag_id = request.data.get("tag_id")

        try:
            tag = Tag.objects.get(pk=tag_id)
        except Tag.DoesNotExist:
            return Response({"detail": "Tag not found."}, status=status.HTTP_404_NOT_FOUND)

        AssetTag.objects.get_or_create(asset=asset, tag=tag)
        return Response({"detail": f"Tag '{tag.name}' added to asset '{asset.name}'."})

    @action(detail=True, methods=["post"], url_path="remove-tag")
    def remove_tag(self, request, pk=None):
        """Detach a tag from an asset."""
        asset = self.get_object()
        tag_id = request.data.get("tag_id")
        AssetTag.objects.filter(asset=asset, tag_id=tag_id).delete()
        return Response({"detail": "Tag removed."})

    @action(detail=True, methods=["post"], url_path="upload-version")
    def upload_version(self, request, pk=None):
        """
         Upload a new version for an existing asset.
        Accepts multipart/form-data with:
        - upload_file
        - changes_note (optional)
        """
        asset = self.get_object()
        upload_file = request.FILES.get("upload_file")
        if not upload_file:
            return Response({"detail": "upload_file is required."}, status=status.HTTP_400_BAD_REQUEST)

        changes_note = request.data.get("changes_note", "")

        with transaction.atomic():
            next_version = (asset.versions.aggregate(models.Max("version_number"))["version_number__max"] or 0) + 1

            version = Version.objects.create(
                asset=asset,
                version_number=next_version,
                upload_file=upload_file,  #updated new file upload field
                file_path=upload_file.name,
                uploaded_by=request.user,
                changes_note=changes_note,
            )

            asset.current_version = version
            asset.file_path = version.file_path
            asset.size_bytes = upload_file.size
            asset.save(update_fields=["current_version", "file_path", "size_bytes"])

        return Response(
            VersionSerializer(version, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


# -----------------------------
# Version ViewSet (Minor update)
# -----------------------------
class VersionViewSet(viewsets.ModelViewSet):
    queryset = Version.objects.select_related("asset", "uploaded_by").all()
    serializer_class = VersionSerializer
    permission_classes = [IsAdminOrEditor]

    def perform_create(self, serializer):
        """Assign uploader automatically."""
        serializer.save(uploaded_by=self.request.user)


# -----------------------------
# AssetTag ViewSet
# -----------------------------
class AssetTagViewSet(viewsets.ModelViewSet):
    queryset = AssetTag.objects.select_related("asset", "tag").all()
    serializer_class = AssetTagSerializer
    permission_classes = [IsAdminOrEditor]


# -----------------------------
# AssetMetadata ViewSet
# -----------------------------
class AssetMetadataViewSet(viewsets.ModelViewSet):
    queryset = AssetMetadata.objects.select_related("asset", "field").all()
    serializer_class = AssetMetadataSerializer
    permission_classes = [IsAdminOrEditor]