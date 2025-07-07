from django.contrib import admin
from django.urls import path, include
from .views import dashboard_stats

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/dashboard-stats/', dashboard_stats, name='dashboard-stats'),

    path('api/users/', include('users.urls')),
    path('api/companies/', include('companies.urls')),
    path('api/banks/', include('banks.urls')),
    path('api/cost-centres/', include('cost_centres.urls')),
    path('api/transaction-types/', include('transaction_types.urls')),
    path('api/transactions/', include('transactions.urls')),

    path('api/projects/', include('projects.urls')),
    path('api/', include('properties.urls')),   # change to mount properties.urls directly under api/
    path('api/entities/', include('entities.urls')),
    path('api/receipts/', include('receipts.urls')),
    path('api/assets/', include('assets.urls')),
    path('api/contacts/', include('contacts.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
