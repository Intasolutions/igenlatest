from django.contrib import admin
from .models import Project, Property, ProjectKeyDate, Contact

# Inline: Properties within Project Admin
class PropertyInline(admin.TabularInline):
    model = Property
    extra = 1
    show_change_link = True

# Inline: Key Dates within Project Admin
class ProjectKeyDateInline(admin.TabularInline):
    model = ProjectKeyDate
    extra = 1
    show_change_link = True


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'start_date', 'end_date', 'expected_return',
        'city', 'district', 'state', 'country'
    )
    search_fields = ('name', 'stakeholders', 'city', 'district')
    list_filter = ('start_date', 'end_date', 'state', 'country')
    inlines = [PropertyInline, ProjectKeyDateInline]
    autocomplete_fields = ['project_manager', 'key_stakeholder']


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'project', 'location', 'purchase_date',
        'purchase_price', 'expected_rent', 'status'
    )
    list_filter = ('status', 'project', 'purchase_date')
    search_fields = ('name', 'location', 'project__name')


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone')
    search_fields = ('name', 'email', 'phone')
