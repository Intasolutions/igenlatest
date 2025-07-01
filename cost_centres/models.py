from django.db import models
from companies.models import Company

class CostCentre(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='cost_centres')
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['company', 'code']

    def __str__(self):
        return f"{self.company.name} - {self.name} ({self.code})"
