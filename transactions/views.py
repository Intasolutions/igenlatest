from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view
from rest_framework.parsers import MultiPartParser
from .models import Transaction, ClassifiedTransaction
from .serializers import TransactionSerializer, ClassifiedTransactionSerializer
import csv
from io import TextIOWrapper


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

    @action(detail=True, methods=["get"])
    def classified_entries(self, request, pk=None):
        """
        Custom endpoint: /transactions/{id}/classified_entries/
        Returns all classified (split) entries for this transaction.
        """
        try:
            transaction = self.get_object()
        except Transaction.DoesNotExist:
            return Response({"error": "Transaction not found."}, status=status.HTTP_404_NOT_FOUND)

        classified = ClassifiedTransaction.objects.filter(transaction=transaction)
        serializer = ClassifiedTransactionSerializer(classified, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ClassifiedTransactionViewSet(viewsets.ModelViewSet):
    serializer_class = ClassifiedTransactionSerializer
    http_method_names = ['get', 'post', 'put', 'patch', 'delete']

    def get_queryset(self):
        """
        Filters classified transactions based on the 'transaction' query parameter if provided.
        """
        queryset = ClassifiedTransaction.objects.all()
        transaction_id = self.request.query_params.get('transaction')
        if transaction_id:
            queryset = queryset.filter(transaction__id=transaction_id)
        return queryset

    def create(self, request, *args, **kwargs):
        data = request.data

        # 1. Must receive a list of split rows
        if not isinstance(data, list) or len(data) == 0:
            return Response({"error": "Expected a non-empty list of split entries."},
                            status=status.HTTP_400_BAD_REQUEST)

        transaction_id = data[0].get("transaction")
        try:
            transaction = Transaction.objects.get(id=transaction_id)
        except Transaction.DoesNotExist:
            return Response({"error": "Transaction not found."}, status=status.HTTP_404_NOT_FOUND)

        # 2. Calculate total split amount
        total_split_amount = 0
        for entry in data:
            try:
                total_split_amount += float(entry.get("amount", 0))
            except Exception:
                return Response({"error": "Invalid amount in one of the split entries."},
                                status=status.HTTP_400_BAD_REQUEST)

        if float(transaction.amount) != total_split_amount:
            return Response(
                {"error": f"Split amount ({total_split_amount}) must equal the transaction amount ({transaction.amount})."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Delete existing classifications for this transaction
        ClassifiedTransaction.objects.filter(transaction=transaction).delete()

        # 4. Save new splits
        serializer = self.get_serializer(data=data, many=True)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ✅ Bulk Upload View (POST + OPTIONS for CORS-safe)
@api_view(["POST", "OPTIONS"])
def bulk_upload_transactions(request):
    """
    Upload CSV file containing multiple transactions.
    Each row must include: company, bank_account, cost_centre, transaction_type, direction, amount, date, notes
    """
    if "file" not in request.FILES:
        return Response({"error": "CSV file is required."}, status=status.HTTP_400_BAD_REQUEST)

    csv_file = request.FILES["file"]

    try:
        decoded_file = TextIOWrapper(csv_file.file, encoding="utf-8")
        reader = csv.DictReader(decoded_file)

        transactions = []
        errors = []

        for row_number, row in enumerate(reader, start=1):
            serializer = TransactionSerializer(data=row)
            if serializer.is_valid():
                transactions.append(serializer)
            else:
                errors.append({
                    "row": row_number,
                    "data": row,
                    "errors": serializer.errors
                })

        if errors:
            return Response({
                "message": "Validation failed for some rows.",
                "errors": errors
            }, status=status.HTTP_400_BAD_REQUEST)

        for serializer in transactions:
            serializer.save()

        return Response({"message": f"{len(transactions)} transactions uploaded successfully."}, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
