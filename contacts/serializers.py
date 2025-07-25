from rest_framework import serializers
from .models import Contact
from projects.models import Project
from properties.models import Property

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'name']

class PropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = ['id', 'name']

class ContactSerializer(serializers.ModelSerializer):
    # Read-only fields (for display)
    linked_projects = ProjectSerializer(many=True, read_only=True)
    linked_properties = PropertySerializer(many=True, read_only=True)

    # Write-only fields (for submission)
    linked_project_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Project.objects.all(), write_only=True, source='linked_projects'
    )
    linked_property_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Property.objects.all(), write_only=True, source='linked_properties'
    )

    class Meta:
        model = Contact
        fields = '__all__'

    def validate_phone(self, value):
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError("Phone number must be exactly 10 digits.")
        return value

    def validate_pan(self, value):
        if value:
            qs = Contact.objects.exclude(pk=self.instance.pk if self.instance else None).filter(pan=value)
            if qs.exists():
                raise serializers.ValidationError("PAN must be unique.")
        return value

    def validate(self, data):
        contact_type = data.get('type')
        gst = data.get('gst')
        stakeholder_types = data.get('stakeholder_types')

        if not stakeholder_types:
            raise serializers.ValidationError({'stakeholder_types': "At least one stakeholder type is required."})

        if contact_type == 'Company' and not gst:
            raise serializers.ValidationError({'gst': "GST number is required for Company type contacts."})

        return data
