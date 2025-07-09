from rest_framework import serializers
from .models import Property, PropertyDocument, PropertyKeyDate

class PropertyDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyDocument
        fields = '__all__'

class PropertyKeyDateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyKeyDate
        fields = '__all__'

class PropertySerializer(serializers.ModelSerializer):
    documents = PropertyDocumentSerializer(many=True, read_only=True)
    key_dates = PropertyKeyDateSerializer(many=True, read_only=True)
    company_name = serializers.ReadOnlyField(source='company.name')
    is_active_display = serializers.SerializerMethodField()
    document_urls = serializers.SerializerMethodField()  # ✅ Add this field

    class Meta:
        model = Property
        fields = '__all__'  # All model fields
        extra_fields = ['company_name', 'is_active_display', 'document_urls']  # ✅ Include custom fields

    def get_is_active_display(self, obj):
        return "Active" if obj.is_active else "Inactive"

    def get_document_urls(self, obj):
        # ✅ Safely return URLs for uploaded files
        return [doc.file_url.url for doc in obj.documents.all() if doc.file_url]

    def to_internal_value(self, data):
        data = data.copy()
        for field in ['status', 'purpose']:
            value = data.get(field)
            if isinstance(value, list) and len(value) > 0:
                data[field] = value[0]
        return super().to_internal_value(data)

