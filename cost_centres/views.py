from rest_framework import viewsets
from .models import CostCentre
from .serializers import CostCentreSerializer
from users.permissions import IsSuperUser

class CostCentreViewSet(viewsets.ModelViewSet):
    queryset = CostCentre.objects.all()
    serializer_class = CostCentreSerializer
    permission_classes = [IsSuperUser]
