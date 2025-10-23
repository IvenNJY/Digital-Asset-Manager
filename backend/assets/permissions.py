# assets/permissions.py
from rest_framework import permissions


class IsAdminOrEditor(permissions.BasePermission):
    """
    Allow only users in 'admin' or 'editor' groups to perform write operations.
    'viewer' group can only read (GET, HEAD, OPTIONS).
    """

    def has_permission(self, request, view):
        # Safe methods (GET, HEAD, OPTIONS) are allowed for everyone logged in
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated

        # For modifying actions (POST, PUT, PATCH, DELETE)
        if not request.user or not request.user.is_authenticated:
            return False

        user_groups = set(request.user.groups.values_list("name", flat=True))
        return bool(user_groups.intersection({"admin", "editor"}))
