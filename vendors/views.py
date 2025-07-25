from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import Vendor
from .serializers import VendorSerializer
from users.permissions import IsSuperUserOrPropertyManager


class VendorViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Vendor data with filtering, searching, and ordering.
    Access:
      - SUPER_USER: all vendors
      - PROPERTY_MANAGER: all vendors
      - Others: vendors linked to their associated companies
    """
    serializer_class = VendorSerializer
    permission_classes = [IsAuthenticated, IsSuperUserOrPropertyManager]

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]

    filterset_fields = ['vendor_type']
    search_fields = [
        'vendor_name',
        'contact_person',
        'pan_number',
        'gst_number',
        'email',
        'phone_number'
    ]
    ordering_fields = ['created_on', 'vendor_name']

    def get_queryset(self):
        user = self.request.user

        if user.role in ['SUPER_USER', 'PROPERTY_MANAGER']:
            return Vendor.objects.all().order_by('-created_on')

        # Fallback for CENTER_HEAD, ACCOUNTANT, etc.
        return Vendor.objects.filter(company__in=user.companies.all()).order_by('-created_on')
