from rest_framework import serializers
from .models import Contract, ContractMilestone

class ContractMilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContractMilestone
        fields = '__all__'

    def validate(self, data):
        status = data.get("status")
        amount = data.get("amount", 0)

        if status == "Paid" and (amount is None or amount <= 0):
            raise serializers.ValidationError("Milestone must have a positive amount before marking as Paid.")

        return data


class ContractSerializer(serializers.ModelSerializer):
    milestones = ContractMilestoneSerializer(many=True, required=False, read_only=True)
    total_contract_value = serializers.SerializerMethodField()
    total_paid = serializers.SerializerMethodField()
    total_due = serializers.SerializerMethodField()

    class Meta:
        model = Contract
        fields = '__all__'

    def get_total_contract_value(self, obj):
        return sum((m.amount or 0) for m in obj.milestones.all())

    def get_total_paid(self, obj):
        return sum((m.amount or 0) for m in obj.milestones.all() if m.status == "Paid")

    def get_total_due(self, obj):
        return self.get_total_contract_value(obj) - self.get_total_paid(obj)

    def validate_document(self, value):
        if value:
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("File size must not exceed 5MB.")
            valid_extensions = ['.pdf', '.jpg', '.jpeg', '.png']
            if not any(value.name.lower().endswith(ext) for ext in valid_extensions):
                raise serializers.ValidationError("Only PDF, JPG, JPEG, or PNG files are allowed.")
        return value
