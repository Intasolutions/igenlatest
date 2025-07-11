from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .views import dashboard_stats  # Optional: keep if you're using custom stats view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/dashboard-stats/', dashboard_stats, name='dashboard-stats'),

    # Core modules
    path('api/users/', include('users.urls')),
    path('api/companies/', include('companies.urls')),
    path('api/banks/', include('banks.urls')),
    path('api/cost-centres/', include('cost_centres.urls')),
    path('api/transaction-types/', include('transaction_types.urls')),
    path('api/transactions/', include('transactions.urls')),

    # Project and Property modules
    path('api/projects/', include('projects.urls')),           # Includes CRUD + bulk upload
    path('api/properties/', include('properties.urls')),       # Changed from '' to 'properties/' for clarity

    # Other modules
    path('api/entities/', include('entities.urls')),
    path('api/receipts/', include('receipts.urls')),
    path('api/assets/', include('assets.urls')),
    path('api/contacts/', include('contacts.urls')),
]

# Serve media files in development
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
