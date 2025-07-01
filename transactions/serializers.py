from rest_framework import serializers
from .models import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    bank_name = serializers.CharField(source='bank_account.account_name', read_only=True)
    cost_centre_name = serializers.CharField(source='cost_centre.name', read_only=True)
    transaction_type_name = serializers.CharField(source='transaction_type.name', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'company', 'company_name',
            'bank_account', 'bank_name',
            'cost_centre', 'cost_centre_name',
            'transaction_type', 'transaction_type_name',
            'direction', 'amount', 'date', 'notes', 'created_at'
        ]
