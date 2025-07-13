
import uuid
from django.db import models
from companies.models import Company
from banks.models import BankAccount
from cost_centres.models import CostCentre
from transaction_types.models import TransactionType
from entities.models import Entity
from assets.models import Asset
from contracts.models import Contract

class Transaction(models.Model):
    TRANSACTION_DIRECTION = [
        ('CREDIT', 'Credit (Income)'),
        ('DEBIT', 'Debit (Expense)'),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='transactions')
    bank_account = models.ForeignKey(BankAccount, on_delete=models.CASCADE, related_name='transactions')
    cost_centre = models.ForeignKey(CostCentre, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.ForeignKey(TransactionType, on_delete=models.CASCADE, related_name='transactions')
    direction = models.CharField(max_length=6, choices=TRANSACTION_DIRECTION)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.company.name}: {self.direction} ₹{self.amount} on {self.date}"

class ClassifiedTransaction(models.Model):
    classification_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name='classifications')
    cost_centre = models.ForeignKey(CostCentre, on_delete=models.CASCADE)
    entity = models.ForeignKey(Entity, on_delete=models.CASCADE)
    transaction_type = models.ForeignKey(TransactionType, on_delete=models.CASCADE)
    asset = models.ForeignKey(Asset, on_delete=models.SET_NULL, null=True, blank=True)
    contract = models.ForeignKey(Contract, on_delete=models.SET_NULL, null=True, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    value_date = models.DateField()
    remarks = models.TextField(blank=True, null=True)
    is_active_classification = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)