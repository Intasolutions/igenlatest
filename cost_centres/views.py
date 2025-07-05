from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import CostCentre
from .serializers import CostCentreSerializer
from users.permissions import IsSuperUser

class CostCentreViewSet(viewsets.ModelViewSet):
    queryset = CostCentre.objects.all()
    serializer_class = CostCentreSerializer
    permission_classes = [IsSuperUser]

    def get_queryset(self):
        # Only return active cost centres by default
        return CostCentre.objects.filter(is_active=True)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False  # Soft delete
        instance.save()
        return Response(
            {'detail': 'Cost Centre soft-deleted successfully.'},
            status=status.HTTP_204_NO_CONTENT
        )
