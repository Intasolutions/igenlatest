from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import TransactionType
from .serializers import TransactionTypeSerializer
from users.permissions import IsSuperUser

class TransactionTypeViewSet(viewsets.ModelViewSet):
    queryset = TransactionType.objects.all()  # ✅ INCLUDE Active + Inactive
    serializer_class = TransactionTypeSerializer
    permission_classes = [IsSuperUser]

def get_queryset(self):
    queryset = TransactionType.objects.all()
    direction = self.request.query_params.get('direction')
    status_param = self.request.query_params.get('status')

    if direction:
        queryset = queryset.filter(direction=direction)  # ← properly indented

    if status_param:
        queryset = queryset.filter(status=status_param)  # ← properly indented

    return queryset



    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.status = 'Inactive'  # Soft delete by marking as Inactive
        instance.save()
        return Response(
            {'detail': 'Transaction Type soft-deleted successfully.'},
            status=status.HTTP_204_NO_CONTENT
        )
