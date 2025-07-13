from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Transaction, ClassifiedTransaction
from .serializers import TransactionSerializer, ClassifiedTransactionSerializer


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer


class ClassifiedTransactionViewSet(viewsets.ModelViewSet):
    queryset = ClassifiedTransaction.objects.all()
    serializer_class = ClassifiedTransactionSerializer
    http_method_names = ['get', 'post', 'put', 'patch', 'delete']  # Ensure POST is allowed

    def create(self, request, *args, **kwargs):
        """Optional override to debug POST errors from React."""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("❌ ClassifiedTransaction Validation Errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
