# assets/models.py
from django.conf import settings
from django.db import models
import os  # Used to construct file paths dynamically


class Folder(models.Model):
    folder_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    parent_folder = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='subfolders'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_folders'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    description = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'folders'
        ordering = ['name']

    def __str__(self):
        return self.name

# Handles where uploaded asset files are stored
def asset_upload_path(instance, filename):
    """Return upload path for asset files."""
    return os.path.join('uploads', 'assets', filename)


class Asset(models.Model):
    ASSET_TYPE_IMAGE = 'image'
    ASSET_TYPE_VIDEO = 'video'
    ASSET_TYPE_DOCUMENT = 'document'
    ASSET_TYPE_GLB = 'glb'
    ASSET_TYPE_OTHER = 'other'

    ASSET_TYPES = [
        (ASSET_TYPE_IMAGE, 'Image'),
        (ASSET_TYPE_VIDEO, 'Video'),
        (ASSET_TYPE_DOCUMENT, 'Document'),
        (ASSET_TYPE_GLB, 'GLB'),
        (ASSET_TYPE_OTHER, 'Other'),
    ]

    asset_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    asset_type = models.CharField(max_length=20, choices=ASSET_TYPES)
    upload_file = models.FileField(upload_to=asset_upload_path, null=True, blank=True)
    file_path = models.CharField(max_length=500)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='uploaded_assets'
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    size_bytes = models.BigIntegerField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    current_version = models.ForeignKey(
        'Version',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='current_for_assets'
    )

    class Meta:
        db_table = 'assets'
        ordering = ['-uploaded_at']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['asset_type']),
            models.Index(fields=['uploaded_at']),
        ]

    def save(self, *args, **kwargs):
        if self.upload_file:
            self.file_path = self.upload_file.name
            self.size_bytes = self.upload_file.size
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

def version_upload_path(instance, filename):
    return os.path.join('uploads', 'versions', filename)

class AssetFolder(models.Model):
    asset = models.ForeignKey(
        Asset,
        on_delete=models.CASCADE,
        related_name='folder_mappings'
    )
    folder = models.ForeignKey(
        Folder,
        on_delete=models.CASCADE,
        related_name='asset_mappings'
    )

    class Meta:
        db_table = 'asset_folders'
        unique_together = ('asset', 'folder')
        indexes = [
            models.Index(fields=['asset']),
            models.Index(fields=['folder']),
        ]

    def __str__(self):
        return f"{self.asset.name} → {self.folder.name}"


# Handles where uploaded version files are stored


class AssetFolder(models.Model):
    """
    Junction table: Links Assets to Folders (one asset → many folders)
    """
    asset = models.ForeignKey(
        Asset,
        on_delete=models.CASCADE,
        related_name='folder_mappings'
    )
    folder = models.ForeignKey(
        Folder,
        on_delete=models.CASCADE,
        related_name='asset_mappings'
    )

    class Meta:
        db_table = 'asset_folders'
        unique_together = ('asset', 'folder')  # Prevent duplicates
        indexes = [
            models.Index(fields=['asset']),
            models.Index(fields=['folder']),
        ]

    def __str__(self):
        return f"{self.asset.name} → {self.folder.name}"
    
class Version(models.Model):
    """
    Table: Versions
    - unique constraint: (asset, version_number)
    """
    version_id = models.AutoField(primary_key=True)
    asset = models.ForeignKey(
        Asset,
        on_delete=models.CASCADE,
        related_name='versions'
    )
    version_number = models.PositiveIntegerField()

    #  Actual uploaded file for versioning (stored in uploads/versions/)
    upload_file = models.FileField(upload_to=version_upload_path, null=True, blank=True)

    file_path = models.CharField(max_length=500)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='uploaded_versions'
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    changes_note = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'versions'
        unique_together = (('asset', 'version_number'),)
        ordering = ['-asset_id', '-version_number']

    #  Sync file_path with actual uploaded file name
    def save(self, *args, **kwargs):
        if self.upload_file:
            self.file_path = self.upload_file.name
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.asset.name} v{self.version_number}'
    # NEW: Full snapshot
    snapshot = models.JSONField(null=True, blank=True)
    # e.g. {
    #   "asset": {"name": "...", "description": "...", "asset_type": "image"},
    #   "metadata": [{"key": "author", "value": "John", "data_type": "string"}, ...],
    #   "tags": ["nature", "forest"]
    # }

    def save_snapshot(self, asset):
        """Call this before saving a new version"""
        metadata = [
            {
                "key": m.field.name,
                "value": m.value,
                "data_type": m.field.data_type,
            }
            for m in asset.metadata.all()
        ]
        tags = [at.tag.name for at in asset.asset_tags.all()]

        self.snapshot = {
            "asset": {
                "name": asset.name,
                "description": asset.description or "",
                "asset_type": asset.asset_type,
            },
            "metadata": metadata,
            "tags": tags,
        }


class Tag(models.Model):
    """
    Table: Tags
    """
    tag_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        db_table = 'tags'
        ordering = ['name']

    def __str__(self):
        return self.name


class AssetTag(models.Model):
    """
    Table: Asset_Tags (junction table)
    Composite PK: (asset_id, tag_id) — modeled with unique_together
    """
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='asset_tags')
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE, related_name='tagged_assets')

    class Meta:
        db_table = 'asset_tags'
        unique_together = (('asset', 'tag'),)
        indexes = [
            models.Index(fields=['tag']),
            models.Index(fields=['asset']),
        ]

    def __str__(self):
        return f'{self.asset.name} <-> {self.tag.name}'


class MetadataField(models.Model):
    """
    Table: Metadata_Fields
    - data_type enumerates allowed types
    """
    DATA_TYPE_STRING = 'string'
    DATA_TYPE_INTEGER = 'integer'
    DATA_TYPE_DATE = 'date'
    DATA_TYPE_BOOLEAN = 'boolean'
    DATA_TYPE_FLOAT = 'float'

    DATA_TYPES = [
        (DATA_TYPE_STRING, 'String'),
        (DATA_TYPE_INTEGER, 'Integer'),
        (DATA_TYPE_DATE, 'Date'),
        (DATA_TYPE_BOOLEAN, 'Boolean'),
        (DATA_TYPE_FLOAT, 'Float'),
    ]

    field_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    data_type = models.CharField(max_length=20, choices=DATA_TYPES)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_metadata_fields'
    )

    class Meta:
        db_table = 'metadata_fields'
        ordering = ['name']

    def __str__(self):
        return self.name


class AssetMetadata(models.Model):
    """
    Table: Asset_Metadata
    Composite PK: (asset_id, field_id) — modeled with unique_together
    Stores values as TEXT; application logic should validate/cast according to MetadataField.data_type
    """
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='metadata')
    field = models.ForeignKey(MetadataField, on_delete=models.CASCADE, related_name='asset_values')
    value = models.TextField()

    class Meta:
        db_table = 'asset_metadata'
        unique_together = (('asset', 'field'),)
        indexes = [
            models.Index(fields=['field']),
            models.Index(fields=['asset']),
        ]

    def __str__(self):
        return f'{self.asset.name} - {self.field.name}: {self.value}'
