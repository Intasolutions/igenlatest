from django.contrib import admin
from .models import Project, Property

# Inline model for showing properties directly within the project admin
class PropertyInline(admin.TabularInline):
    model = Property
    extra = 1  # how many empty property forms to show
    show_change_link = True

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_date', 'end_date', 'expected_return')
    search_fields = ('name', 'stakeholders')
    list_filter = ('start_date', 'end_date')
    inlines = [PropertyInline]

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('name', 'project', 'location', 'purchase_date', 'purchase_price', 'expected_rent', 'status')
    list_filter = ('status', 'project', 'purchase_date')
    search_fields = ('name', 'location', 'project__name')
