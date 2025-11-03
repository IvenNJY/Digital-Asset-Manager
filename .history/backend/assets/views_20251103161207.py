import json
from django.db import transaction, models
from django.db.models import Max
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST,require_http_methods
from django.contrib.auth.decorators import login_required

from .models import Asset, AssetMetadata, Version, Tag, AssetTag, MetadataField
from .serializers import AssetSerializer, VersionSerializer


# -----------------------------
# Helper: Check user role
# -----------------------------
def _is_admin_or_editor(user):
    return user.is_authenticated and user.groups.filter(name__in=["admin", "editor"]).exists()

# NEW: Helper to get/create root "media" folder
def _get_media_root(user):
    return Folder.objects.get_or_create(
        name="media",
        parent_folder=None,
        defaults={"created_by": user, "description": "Root media folder"}
    )[0]


# -----------------------------
# Upload a new Asset
# -----------------------------
@csrf_exempt
@require_POST
def upload_asset_view(request):
    """Handles file uploads from admin/editor users."""
    if not _is_admin_or_editor(request.user):
        return JsonResponse({"detail": "Not authorized."}, status=403)

    upload_file = request.FILES.get("upload_file")
    if not upload_file:
        return JsonResponse({"detail": "upload_file is required."}, status=400)

    # Get optional fields
    name = request.POST.get("name") or upload_file.name.split("/")[-1]
    asset_type = request.POST.get("asset_type", "other")
    folder = request.POST.get("folder")
    description = request.POST.get("description", "")
    tags_str = request.POST.get("tags", "")

    # Parse metadata JSON if present
    metadata_items = []
    metadata_json = request.POST.get("metadata")
    if metadata_json:
        try:
            metadata_items = json.loads(metadata_json)
            if not isinstance(metadata_items, list):
                return JsonResponse({"detail": "metadata must be a list."}, status=400)
        except json.JSONDecodeError as e:
            return JsonResponse({"detail": f"Invalid metadata JSON: {e}"}, status=400)

    with transaction.atomic():
        # Create Asset
        asset = Asset.objects.create(
            name=name,
            asset_type=asset_type,
            folder_id=folder if folder else None,
            upload_file=upload_file,
            uploaded_by=request.user,
            description=description,
        )

        # File metadata
        asset.file_path = upload_file.name
        asset.size_bytes = upload_file.size
        asset.save()

        # Create initial Version
        version = Version.objects.create(
            asset=asset,
            version_number=1,
            file_path=asset.file_path,
            uploaded_by=request.user,
            changes_note="Initial upload",
        )
        version.save_snapshot(asset)
        version.save()

        asset.current_version = version
        asset.save(update_fields=["current_version"])

        # Handle tags – FIXED BUG
        if tags_str.strip():
            tag_names = [t.strip() for t in tags_str.split(",") if t.strip()]
            for tag_name in tag_names:
                tag_obj, _ = Tag.objects.get_or_create(name=tag_name)
                AssetTag.objects.get_or_create(asset=asset, tag=tag_obj)

        # Handle metadata items
        for item in metadata_items:
            key = item.get("key", "").strip()
            if not key:
                continue
            value = item.get("value", "")
            dtype = item.get("data_type", "string")

            # Get or create MetadataField
            mf, _ = MetadataField.objects.get_or_create(
                name=key,
                defaults={"data_type": dtype, "created_by": request.user}
            )
            if mf.data_type != dtype:
                mf.data_type = dtype
                mf.save()

            AssetMetadata.objects.create(
                asset=asset,
                field=mf,
                value=str(value)
            )

    serializer = AssetSerializer(asset, context={"request": request})
    return JsonResponse(serializer.data, status=201)


# -----------------------------
# List all Assets
# -----------------------------
@csrf_exempt
@require_GET
def asset_list_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "Not authenticated."}, status=401)

    assets = Asset.objects.all().select_related("uploaded_by", "folder")
    serializer = AssetSerializer(assets, many=True, context={"request": request})
    return JsonResponse({"assets": serializer.data}, status=200)


# -----------------------------
# Upload a new Version for an Asset
# -----------------------------
@csrf_exempt
@require_POST
def upload_version_view(request, asset_id):
    if not _is_admin_or_editor(request.user):
        return JsonResponse({"detail": "Not authorized."}, status=403)

    try:
        asset = Asset.objects.get(pk=asset_id)
    except Asset.DoesNotExist:
        return JsonResponse({"detail": "Asset not found."}, status=404)

    upload_file = request.FILES.get("upload_file")
    if not upload_file:
        return JsonResponse({"detail": "upload_file is required."}, status=400)

    changes_note = request.POST.get("changes_note", "")

    with transaction.atomic():
        next_version = (asset.versions.aggregate(models.Max("version_number"))["version_number__max"] or 0) + 1

        version = Version.objects.create(
            asset=asset,
            version_number=next_version,
            upload_file=upload_file,
            file_path=upload_file.name,
            uploaded_by=request.user,
            changes_note=changes_note,
        )
        
        # ADD: Save snapshot for new file version
        version.save_snapshot(asset)
        version.save()

        # Update asset metadata
        asset.current_version = version
        asset.file_path = version.file_path
        asset.size_bytes = upload_file.size
        asset.save(update_fields=["current_version", "file_path", "size_bytes"])

    serializer = VersionSerializer(version, context={"request": request})
    return JsonResponse(serializer.data, status=201)


# -----------------------------
# Add a Tag to an Asset
# -----------------------------
@csrf_exempt
@require_POST
def add_tag_view(request, asset_id):
    if not _is_admin_or_editor(request.user):
        return JsonResponse({"detail": "Not authorized."}, status=403)

    try:
        payload = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"detail": "Invalid JSON payload."}, status=400)

    tag_id = payload.get("tag_id")
    if not tag_id:
        return JsonResponse({"detail": "tag_id is required."}, status=400)

    try:
        asset = Asset.objects.get(pk=asset_id)
        tag = Tag.objects.get(pk=tag_id)
    except (Asset.DoesNotExist, Tag.DoesNotExist):
        return JsonResponse({"detail": "Asset or tag not found."}, status=404)

    AssetTag.objects.get_or_create(asset=asset, tag=tag)
    return JsonResponse({"detail": f"Tag '{tag.name}' added."}, status=200)


# -----------------------------
# Remove a Tag from an Asset
# -----------------------------
@csrf_exempt
@require_POST
def remove_tag_view(request, asset_id):
    if not _is_admin_or_editor(request.user):
        return JsonResponse({"detail": "Not authorized."}, status=403)

    try:
        payload = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"detail": "Invalid JSON payload."}, status=400)

    tag_id = payload.get("tag_id")
    if not tag_id:
        return JsonResponse({"detail": "tag_id is required."}, status=400)

    AssetTag.objects.filter(asset_id=asset_id, tag_id=tag_id).delete()
    return JsonResponse({"detail": "Tag removed."}, status=200)


# -----------------------------
# Get tags for a specific asset
# -----------------------------
@csrf_exempt
@require_GET
def asset_tags_view(request, asset_id):
    """Return tags linked to a specific asset."""
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "Not authenticated."}, status=401)

    try:
        asset = Asset.objects.get(pk=asset_id)
    except Asset.DoesNotExist:
        return JsonResponse({"detail": "Asset not found."}, status=404)

    tags = AssetTag.objects.filter(asset=asset).select_related("tag")
    tag_names = [t.tag.name for t in tags]
    return JsonResponse({"tags": tag_names}, status=200)


# -----------------------------
# Update Asset (name, desc, type, tags)
# -----------------------------
@csrf_exempt
def update_asset_view(request, asset_id):
    """
    PATCH /api/assets/<id>/ or DELETE /api/assets/<id>/
    Updates asset fields and tags OR deletes asset.
    """
    print("=== DEBUG update_asset_view ===")
    print("User:", request.user)
    print("Is authenticated:", request.user.is_authenticated)
    print("Groups:", list(request.user.groups.values_list('name', flat=True)))
    print("Is admin/editor:", _is_admin_or_editor(request.user))
    print("Method:", request.method)
    print("=================================")

    if request.method == "PATCH":
        # ... your existing PATCH logic (unchanged) ...
        if not _is_admin_or_editor(request.user):
            return JsonResponse({"detail": "Not authorized."}, status=403)

        try:
            payload = json.loads(request.body or "{}")
        except json.JSONDecodeError:
            return JsonResponse({"detail": "Invalid JSON."}, status=400)

        try:
            asset = Asset.objects.get(pk=asset_id)
        except Asset.DoesNotExist:
            return JsonResponse({"detail": "Asset not found."}, status=404)

        with transaction.atomic():
            # Update simple fields
            name = payload.get("name")
            desc = payload.get("description")
            asset_type = payload.get("asset_type")
            if name is not None:
                asset.name = name
            if desc is not None:
                asset.description = desc
            if asset_type is not None:
                asset.asset_type = asset_type
            asset.save()

            # Handle tags (replace all)
            if "tags" in payload:
                tag_names = [t.strip() for t in payload.get("tags", []) if t.strip()]
                AssetTag.objects.filter(asset=asset).delete()
                for tag_name in tag_names:
                    tag, _ = Tag.objects.get_or_create(name=tag_name)
                    AssetTag.objects.create(asset=asset, tag=tag)

            # CREATE VERSION SNAPSHOT
            next_version_num = (
                asset.versions.aggregate(max_version=Max("version_number"))["max_version"] or 0
            ) + 1

            version = Version(
                asset=asset,
                version_number=next_version_num,
                uploaded_by=request.user,
                changes_note="Updated name, description, type, or tags",
                file_path=asset.file_path,
            )
            version.save_snapshot(asset)
            version.save()

            asset.current_version = version
            asset.save(update_fields=["current_version"])

        serializer = AssetSerializer(asset, context={"request": request})
        return JsonResponse(serializer.data, status=200)

    elif request.method == "DELETE":
        if not _is_admin_or_editor(request.user):
            return JsonResponse({"detail": "Not authorized."}, status=403)

        try:
            asset = Asset.objects.get(pk=asset_id)
        except Asset.DoesNotExist:
            return JsonResponse({"detail": "Asset not found."}, status=404)

        with transaction.atomic():
            asset.delete()  # Cascades to versions, metadata, tags

        return JsonResponse({"detail": "Asset deleted successfully."}, status=200)

    else:
        return JsonResponse({"detail": "Method not allowed."}, status=405)


# -----------------------------
# Update Metadata for an Asset
# -----------------------------

@csrf_exempt
def asset_metadata_view(request, asset_id):
    if request.method == "GET":
        if not request.user.is_authenticated:
            return JsonResponse({"detail": "Not authenticated"}, status=401)
        try:
            asset = Asset.objects.get(pk=asset_id)
        except Asset.DoesNotExist:
            return JsonResponse({"detail": "Asset not found"}, status=404)

        metadata = AssetMetadata.objects.filter(asset=asset).select_related("field")
        items = [
            {
                "key": m.field.name,
                "value": m.value,
                "data_type": m.field.data_type,
            }
            for m in metadata
        ]
        return JsonResponse({"metadata": items}, status=200)

    elif request.method == "PATCH":
        if not _is_admin_or_editor(request.user):
            return JsonResponse({"detail": "Not authorized"}, status=403)

        try:
            payload = json.loads(request.body)
            metadata = payload.get("metadata", [])
        except json.JSONDecodeError:
            return JsonResponse({"detail": "Invalid JSON"}, status=400)

        try:
            asset = Asset.objects.get(pk=asset_id)
        except Asset.DoesNotExist:
            return JsonResponse({"detail": "Asset not found"}, status=404)

        with transaction.atomic():
            # Delete all existing
            AssetMetadata.objects.filter(asset=asset).delete()
            # Recreate
            for item in metadata:
                key = item["key"].strip()
                if not key:
                    continue
                field, _ = MetadataField.objects.get_or_create(
                    name=key,
                    defaults={"data_type": item["data_type"], "created_by": request.user}
                )
                if field.data_type != item["data_type"]:
                    field.data_type = item["data_type"]
                    field.save()
                AssetMetadata.objects.create(
                    asset=asset,
                    field=field,
                    value=str(item["value"])
                )

            # --- CREATE VERSION SNAPSHOT ---
            next_version = (
                asset.versions.aggregate(max_version=Max("version_number"))["max_version"] or 0
            ) + 1

            version = Version.objects.create(
                asset=asset,
                version_number=next_version,
                uploaded_by=request.user,
                changes_note="Updated metadata",
                file_path=asset.file_path,
            )
            version.save_snapshot(asset)
            version.save()

            asset.current_version = version
            asset.save(update_fields=["current_version"])

        return JsonResponse({"detail": "Metadata updated"}, status=200)


# -----------------------------
# Get version history for a specific asset
# -----------------------------
@csrf_exempt
@require_GET
def asset_versions_view(request, asset_id):
    """GET /api/assets/<id>/versions/ — Returns all versions with snapshots."""
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "Not authenticated."}, status=401)

    try:
        asset = Asset.objects.get(pk=asset_id)
    except Asset.DoesNotExist:
        return JsonResponse({"detail": "Asset not found."}, status=404)

    versions_qs = Version.objects.filter(asset=asset).order_by("-version_number")
    serializer = VersionSerializer(versions_qs, many=True, context={"request": request})
    return JsonResponse({"versions": serializer.data}, status=200)

# -----------------------------
# Delete an Asset
# -----------------------------
@csrf_exempt
@require_http_methods(["DELETE"])
def delete_asset_view(request, asset_id):
    """
    DELETE /api/assets/<id>/
    Permanently deletes the asset and all related data.
    """
    if not _is_admin_or_editor(request.user):
        return JsonResponse({"detail": "Not authorized."}, status=403)

    try:
        asset = Asset.objects.get(pk=asset_id)
    except Asset.DoesNotExist:
        return JsonResponse({"detail": "Asset not found."}, status=404)

    with transaction.atomic():
        # Optional: Add soft-delete or logging here
        asset.delete()  # Deletes asset + cascade: versions, metadata, tags

    return JsonResponse({"detail": "Asset deleted successfully."}, status=200)

from django.http import JsonResponse
from .models import Asset

def asset_summary_view(request):
    # Fetch all assets
    all_assets = Asset.objects.all()

    # Count based on file extensions
    image_exts = ('.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg')
    video_exts = ('.mp4', '.mov', '.avi', '.mkv', '.webm')
    doc_exts = ('.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt')

    # Categorize and count
    image_count = all_assets.filter(file_path__iendswith=image_exts[0])
    for ext in image_exts[1:]:
        image_count = image_count | all_assets.filter(file_path__iendswith=ext)
    image_count = image_count.count()

    video_count = all_assets.filter(file_path__iendswith=video_exts[0])
    for ext in video_exts[1:]:
        video_count = video_count | all_assets.filter(file_path__iendswith=ext)
    video_count = video_count.count()

    doc_count = all_assets.filter(file_path__iendswith=doc_exts[0])
    for ext in doc_exts[1:]:
        doc_count = doc_count | all_assets.filter(file_path__iendswith=ext)
    doc_count = doc_count.count()

    all_count = all_assets.count()

    # Return JSON
    return JsonResponse({
        "all": all_count,
        "images": image_count,
        "videos": video_count,
        "documents": doc_count
    })
