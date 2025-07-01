from rest_framework import viewsets
from .models import Transaction
from .serializers import TransactionSerializer
from users.permissions import IsSuperUser

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [IsSuperUser]
