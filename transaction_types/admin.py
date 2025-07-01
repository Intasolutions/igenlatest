from django.contrib import admin
from .models import TransactionType

class TransactionTypeAdmin(admin.ModelAdmin):
    list_display = ['company', 'name', 'type', 'is_active', 'created_at']
    search_fields = ['name']
    list_filter = ['company', 'type', 'is_active']

admin.site.register(TransactionType, TransactionTypeAdmin)
