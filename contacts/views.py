from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend, FilterSet, CharFilter
from django.db.models import JSONField

from .models import Contact
from .serializers import ContactSerializer


class ContactFilter(FilterSet):
    stakeholder_types = CharFilter(method='filter_stakeholder_types')

    class Meta:
        model = Contact
        fields = ['type', 'stakeholder_types']
        filter_overrides = {
            JSONField: {
                'filter_class': CharFilter,
                'extra': lambda f: {'lookup_expr': 'icontains'},
            },
        }

    def filter_stakeholder_types(self, queryset, name, value):
        return queryset.filter(**{f"{name}__icontains": value})


class ContactViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Contact data with filtering and search capabilities.
    """
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ContactFilter  # ✅ Custom filter class to handle JSONField
    search_fields = ['full_name', 'email', 'phone']
    ordering_fields = ['created_at', 'full_name']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'SUPER_USER':
            return Contact.objects.all().order_by('-created_at')
        return Contact.objects.filter(company__in=user.companies.all()).order_by('-created_at')
