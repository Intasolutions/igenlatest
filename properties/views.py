from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Property, PropertyDocument, PropertyKeyDate
from .serializers import PropertySerializer, PropertyDocumentSerializer, PropertyKeyDateSerializer
from users.permissions import IsSuperUser

class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all().prefetch_related('documents', 'key_dates')
    serializer_class = PropertySerializer
    permission_classes = [IsSuperUser]

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        try:
            prop = self.get_object()
            prop.is_active = not prop.is_active
            prop.save()
            return Response({'status': 'success', 'is_active': prop.is_active})
        except Property.DoesNotExist:
            return Response({'status': 'error', 'message': 'Property not found'}, status=status.HTTP_404_NOT_FOUND)

class PropertyDocumentViewSet(viewsets.ModelViewSet):
    queryset = PropertyDocument.objects.all()
    serializer_class = PropertyDocumentSerializer
    permission_classes = [IsSuperUser]

class PropertyKeyDateViewSet(viewsets.ModelViewSet):
    queryset = PropertyKeyDate.objects.all()
    serializer_class = PropertyKeyDateSerializer
    permission_classes = [IsSuperUser]
