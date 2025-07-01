from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, PropertyViewSet, bulk_upload

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='projects')
router.register(r'properties', PropertyViewSet, basename='properties')

# First define custom paths BEFORE router.urls so they take priority.
urlpatterns = [
    path('projects/bulk_upload/', bulk_upload, name='bulk-upload'),
]

# Add router-generated URLs at the end.
urlpatterns += router.urls
