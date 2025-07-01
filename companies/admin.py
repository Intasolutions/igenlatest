from django.contrib import admin
from .models import Company, CompanyDocument

class CompanyDocumentInline(admin.TabularInline):
    model = CompanyDocument
    extra = 0

class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'pan', 'gst', 'created_at']
    search_fields = ['name', 'pan', 'gst']
    inlines = [CompanyDocumentInline]

admin.site.register(Company, CompanyAdmin)
