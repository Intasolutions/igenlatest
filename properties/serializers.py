from rest_framework import serializers
from .models import Property

class PropertySerializer(serializers.ModelSerializer):
    project_name = serializers.ReadOnlyField(source='project.name')

    class Meta:
        model = Property
        fields = '__all__'
