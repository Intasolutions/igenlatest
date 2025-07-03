from django.db import models
from companies.models import Company
from properties.models import Property
from projects.models import Project

class Asset(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='assets')
    property = models.ForeignKey(Property, on_delete=models.SET_NULL, null=True, blank=True, related_name='assets')
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True, related_name='assets')
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=255)
    purchase_date = models.DateField()
    purchase_price = models.DecimalField(max_digits=12, decimal_places=2)
    warranty_expiry = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=255)
    maintenance_frequency = models.CharField(max_length=255)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.serial_number if hasattr(self, 'serial_number') else ''}"

class AssetServiceDue(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='service_dues')
    due_date = models.DateField()
    description = models.CharField(max_length=255)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Service on {self.due_date} for {self.asset}"

class AssetDocument(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='documents')
    file = models.FileField(upload_to='asset_docs/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Document for {self.asset}"
