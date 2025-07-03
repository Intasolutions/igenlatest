from django.db import models
from entities.models import Entity
from banks.models import BankAccount  # ✅ Fix: Import the correct model
from cost_centres.models import CostCentre
from companies.models import Company

class Receipt(models.Model):
    TRANSACTION_TYPES = [
        ('RECEIPT', 'Receipt'),
        ('PAYMENT', 'Payment'),
    ]

    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    date = models.DateField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reference = models.CharField(max_length=255, blank=True)
    entity = models.ForeignKey(Entity, on_delete=models.SET_NULL, null=True, blank=True)
    bank = models.ForeignKey(BankAccount, on_delete=models.SET_NULL, null=True, blank=True)  # ✅ Corrected field
    cost_centre = models.ForeignKey(CostCentre, on_delete=models.SET_NULL, null=True, blank=True)
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_transaction_type_display()} - {self.amount} on {self.date}"
