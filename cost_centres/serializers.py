from rest_framework import serializers
from .models import CostCentre

class CostCentreSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)

    class Meta:
        model = CostCentre
        fields = ['id', 'company', 'company_name', 'name', 'code', 'description', 'is_active', 'created_at']
