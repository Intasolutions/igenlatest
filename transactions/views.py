from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Transaction, ClassifiedTransaction
from .serializers import TransactionSerializer, ClassifiedTransactionSerializer
from users.permissions import IsSuperUser

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [IsSuperUser]


class ClassifiedTransactionViewSet(viewsets.ModelViewSet):
    queryset = ClassifiedTransaction.objects.all()
    serializer_class = ClassifiedTransactionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        transaction = serializer.validated_data['transaction']
        if not ClassifiedTransaction.objects.filter(transaction=transaction).exists():
            # Optional: Flag transaction if supporting field exists
            pass  # You can mark parent inactive here if modeled
        serializer.save()