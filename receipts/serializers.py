from rest_framework import serializers
from .models import Receipt

class ReceiptSerializer(serializers.ModelSerializer):
    transaction_type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)

    class Meta:
        model = Receipt
        fields = [
            'id',
            'transaction_type',
            'transaction_type_display',
            'date',
            'amount',
            'reference',
            'entity',
            'bank',
            'cost_centre',
            'company',
            'notes',
            'created_at',
        ]
