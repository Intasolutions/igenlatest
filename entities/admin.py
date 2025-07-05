from django.contrib import admin
from .models import Entity

@admin.register(Entity)
class EntityAdmin(admin.ModelAdmin):
    list_display = ('entity_id', 'company', 'name', 'entity_type', 'linked_property', 'linked_project', 'status', 'created_at')
    list_filter = ('company', 'entity_type', 'status')
    search_fields = ('name', 'company__name', 'remarks')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)
