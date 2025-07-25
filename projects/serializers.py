from rest_framework import serializers
from .models import Project, Property, ProjectKeyDate, Contact


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['id', 'name', 'email', 'phone']


class ProjectKeyDateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectKeyDate
        fields = ['id', 'label', 'due_date', 'remarks']


class ProjectSerializer(serializers.ModelSerializer):
    project_manager = ContactSerializer(read_only=True)
    key_stakeholder = ContactSerializer(read_only=True)
    project_manager_id = serializers.PrimaryKeyRelatedField(
        queryset=Contact.objects.all(), source='project_manager', write_only=True, required=False
    )
    key_stakeholder_id = serializers.PrimaryKeyRelatedField(
        queryset=Contact.objects.all(), source='key_stakeholder', write_only=True, required=False
    )
    key_dates = ProjectKeyDateSerializer(many=True, required=False)

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'start_date', 'end_date', 'stakeholders', 'expected_return',
            'landmark', 'pincode', 'city', 'district', 'state', 'country',
            'project_manager', 'project_manager_id',
            'key_stakeholder', 'key_stakeholder_id',
            'key_dates'
        ]

    def create(self, validated_data):
        key_dates_data = validated_data.pop('key_dates', [])
        project = Project.objects.create(**validated_data)
        for kd in key_dates_data:
            ProjectKeyDate.objects.create(project=project, **kd)
        return project

    def update(self, instance, validated_data):
        key_dates_data = validated_data.pop('key_dates', [])
        instance = super().update(instance, validated_data)

        if key_dates_data:
            instance.key_dates.all().delete()
            for kd in key_dates_data:
                ProjectKeyDate.objects.create(project=instance, **kd)

        return instance


class PropertySerializer(serializers.ModelSerializer):
    project_name = serializers.ReadOnlyField(source='project.name')

    class Meta:
        model = Property
        fields = '__all__'
