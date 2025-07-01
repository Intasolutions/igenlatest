from django.contrib import admin
from .models import Transaction

class TransactionAdmin(admin.ModelAdmin):
    list_display = ['company', 'direction', 'amount', 'date', 'transaction_type', 'cost_centre', 'bank_account', 'created_at']
    search_fields = ['notes']
    list_filter = ['company', 'direction', 'transaction_type', 'cost_centre', 'bank_account']

admin.site.register(Transaction, TransactionAdmin)
