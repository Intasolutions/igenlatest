from django.db import models
from companies.models import Company
from banks.models import BankAccount
from cost_centres.models import CostCentre
from transaction_types.models import TransactionType

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
