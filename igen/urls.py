from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .views import dashboard_stats  # If used

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/dashboard-stats/', dashboard_stats, name='dashboard-stats'),

    path('api/users/', include('users.urls')),
    path('api/companies/', include('companies.urls')),
    path('api/banks/', include('banks.urls')),
    path('api/cost-centres/', include('cost_centres.urls')),
    path('api/transaction-types/', include('transaction_types.urls')),

    # Register transactions and classified transactions directly
    path('api/', include('transactions.urls')),

    path('api/projects/', include('projects.urls')),
    path('api/properties/', include('properties.urls')),
    path('api/entities/', include('entities.urls')),
    path('api/receipts/', include('receipts.urls')),
    path('api/assets/', include('assets.urls')),
    path('api/contacts/', include('contacts.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
