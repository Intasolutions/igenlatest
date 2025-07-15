from rest_framework import serializers
from .models import Asset, AssetDocument, AssetServiceDue

class AssetServiceDueSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetServiceDue
        fields = '__all__'

class AssetDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetDocument
        fields = '__all__'

class AssetSerializer(serializers.ModelSerializer):
    service_dues = AssetServiceDueSerializer(many=True, read_only=True)
    documents = AssetDocumentSerializer(many=True, read_only=True)

    # Extra fields for frontend display
    company_name = serializers.CharField(source='company.name', read_only=True)
    property_name = serializers.CharField(source='property.name', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)

    class Meta:
        model = Asset
        fields = [
            'id',
            'company',
            'property',
            'project',
            'name',
            'category',
            'purchase_date',
            'purchase_price',
            'warranty_expiry',
            'location',
            'maintenance_frequency',
            'notes',
            'created_at',
            'documents',
            'service_dues',

            # Extra readable names
            'company_name',
            'property_name',
            'project_name',
        ]
