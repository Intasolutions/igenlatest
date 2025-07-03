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

    class Meta:
        model = Asset
        fields = '__all__'
