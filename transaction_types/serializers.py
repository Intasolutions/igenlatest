from rest_framework import serializers
from .models import TransactionType

class TransactionTypeSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)

    class Meta:
        model = TransactionType
        fields = ['id', 'company', 'company_name', 'name', 'type', 'description', 'is_active', 'created_at']
