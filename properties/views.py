from rest_framework import viewsets
from .models import Property
from .serializers import PropertySerializer
from users.permissions import IsSuperUser  # assuming you reuse same permissions

class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [IsSuperUser]
