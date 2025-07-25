from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from .models import Contract, ContractMilestone
from .serializers import ContractSerializer, ContractMilestoneSerializer
import os

class ContractViewSet(viewsets.ModelViewSet):
    queryset = Contract.objects.none()  # Ensures DRF router works with basename
    serializer_class = ContractSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'SUPER_USER':
            return Contract.objects.filter(is_active=True)
        return Contract.objects.filter(company__in=user.companies.all(), is_active=True)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        contract = get_object_or_404(Contract, pk=pk)
        if not contract.document:
            return Response({"error": "No document found."}, status=status.HTTP_404_NOT_FOUND)
        return FileResponse(contract.document.open(), as_attachment=True, filename=os.path.basename(contract.document.name))

class ContractMilestoneViewSet(viewsets.ModelViewSet):
    queryset = ContractMilestone.objects.all()
    serializer_class = ContractMilestoneSerializer
    permission_classes = [IsAuthenticated]
