from django.contrib import admin
from .models import Contact

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'type', 'phone', 'email', 'pan', 'gst']
    search_fields = ['full_name', 'phone', 'email', 'pan']
    list_filter = ['type', 'stakeholder_types']
