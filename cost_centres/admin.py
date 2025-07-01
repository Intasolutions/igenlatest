from django.contrib import admin
from .models import CostCentre

class CostCentreAdmin(admin.ModelAdmin):
    list_display = ['company', 'name', 'code', 'is_active', 'created_at']
    search_fields = ['name', 'code']
    list_filter = ['company', 'is_active']

admin.site.register(CostCentre, CostCentreAdmin)
