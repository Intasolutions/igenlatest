from django.contrib import admin
from .models import Transaction, ClassifiedTransaction

admin.site.register(Transaction)
admin.site.register(ClassifiedTransaction)
