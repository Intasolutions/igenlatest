from rest_framework import viewsets
from .models import Entity
from .serializers import EntitySerializer
from users.permissions import IsSuperUser

class EntityViewSet(viewsets.ModelViewSet):
    queryset = Entity.objects.all()
    serializer_class = EntitySerializer
    permission_classes = [IsSuperUser]
