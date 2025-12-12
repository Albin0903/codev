from rest_framework import permissions

class IsStudent(permissions.BasePermission):
    """
    Permission pour vérifier si l'utilisateur est un étudiant.
    """
    def has_permission(self, request, view):
        # Vérifie si l'utilisateur est connecté et a un profil étudiant
        return bool(request.user and request.user.is_authenticated and hasattr(request.user, 'student'))

class IsCompany(permissions.BasePermission):
    """
    Permission pour vérifier si l'utilisateur est une entreprise.
    """
    def has_permission(self, request, view):
        # Vérifie si l'utilisateur est connecté et a un profil entreprise
        return bool(request.user and request.user.is_authenticated and hasattr(request.user, 'company'))

class IsOwnStudentProfile(permissions.BasePermission):
    """
    Permission pour vérifier qu'un étudiant ne modifie que son propre profil.
    """
    def has_object_permission(self, request, view, obj):
        # Only allow modification of own profile
        return obj.user == request.user

class IsOwnCompanyProfile(permissions.BasePermission):
    """
    Permission pour vérifier qu'une entreprise ne modifie que son propre profil.
    """
    def has_object_permission(self, request, view, obj):
        # Only allow modification of own profile
        return obj.user == request.user

class CanOnlyModifyOwnData(permissions.BasePermission):
    """
    Permission générique pour vérifier que l'utilisateur ne modifie que ses propres données.
    Empêche les modifications d'autres utilisateurs via l'API.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        # Only authenticated users can modify
        return bool(request.user and request.user.is_authenticated)
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # Check if user owns the object
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'student'):
            return obj.student.user == request.user
        if hasattr(obj, 'company'):
            return obj.company.user == request.user
        return False
