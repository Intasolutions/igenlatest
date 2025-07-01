from rest_framework import viewsets
from .models import TransactionType
from .serializers import TransactionTypeSerializer
from users.permissions import IsSuperUser

class TransactionTypeViewSet(viewsets.ModelViewSet):
    queryset = TransactionType.objects.all()
    serializer_class = TransactionTypeSerializer
    permission_classes = [IsSuperUser]
