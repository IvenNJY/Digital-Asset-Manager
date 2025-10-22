# assets/urls.py
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import (
    FolderViewSet,
    AssetViewSet,
    VersionViewSet,
    TagViewSet,
    AssetTagViewSet,
    MetadataFieldViewSet,
    AssetMetadataViewSet,
)

router = DefaultRouter()
router.register(r'folders', FolderViewSet, basename='folder')
router.register(r'', AssetViewSet, basename='asset')
router.register(r'versions', VersionViewSet, basename='version')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'asset-tags', AssetTagViewSet, basename='assettag')
router.register(r'metadata-fields', MetadataFieldViewSet, basename='metadatafield')
router.register(r'asset-metadata', AssetMetadataViewSet, basename='assetmetadata')

urlpatterns = [
    path('', include(router.urls)),
]
