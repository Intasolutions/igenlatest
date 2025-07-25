from rest_framework import serializers
from .models import Vendor

class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = '__all__'

    def validate_pan_number(self, value):
        """
        PAN must be a valid 10-character alphanumeric code.
        """
        if len(value) != 10:
            raise serializers.ValidationError("PAN must be 10 characters long")
        return value.upper()

    def validate_gst_number(self, value):
        """
        GST is optional, but if provided, must be 15 characters long.
        """
        if value and len(value) != 15:
            raise serializers.ValidationError("GST must be 15 characters long")
        return value.upper()

    def validate_ifsc_code(self, value):
        """
        IFSC code must be exactly 11 characters.
        """
        if len(value) != 11:
            raise serializers.ValidationError("IFSC must be 11 characters")
        return value.upper()

    def validate_phone_number(self, value):
        """
        Phone number must be numeric and exactly 10 digits.
        """
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError("Phone must be a 10-digit number")
        return value
