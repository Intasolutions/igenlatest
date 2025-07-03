from rest_framework import viewsets
from .models import Asset, AssetDocument, AssetServiceDue
from .serializers import AssetSerializer, AssetDocumentSerializer, AssetServiceDueSerializer
from rest_framework.permissions import IsAuthenticated

class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.all().order_by('-created_at')
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]

class AssetDocumentViewSet(viewsets.ModelViewSet):
    queryset = AssetDocument.objects.all()
    serializer_class = AssetDocumentSerializer
    permission_classes = [IsAuthenticated]

class AssetServiceDueViewSet(viewsets.ModelViewSet):
    queryset = AssetServiceDue.objects.all()
    serializer_class = AssetServiceDueSerializer
    permission_classes = [IsAuthenticated]
