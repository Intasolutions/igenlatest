from django.db import models
from companies.models import Company
from projects.models import Project

class Property(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('sold', 'Sold'),
        ('inactive', 'Inactive'),
    ]

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='properties',
        help_text="Company owning this property",
    )
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='site_properties',
    )
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=512)
    purchase_date = models.DateField()
    purchase_price = models.DecimalField(max_digits=15, decimal_places=2)
    expected_rent = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')

    def __str__(self):
        return f"{self.name} ({self.project.name})"
