from django.db import models
from django.conf import settings
from companies.models import Company 
# Optional: Reference to existing contact model (adjust app label if needed)
class Contact(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return self.name


class Project(models.Model):
    name = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    stakeholders = models.TextField(blank=True)
    expected_return = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)

    # Address fields
    landmark = models.CharField(max_length=255, blank=True)
    pincode = models.CharField(max_length=10, blank=True)
    city = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, default='Kerala')
    country = models.CharField(max_length=100, default='India')

    # Contacts
    project_manager = models.ForeignKey(Contact, on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_projects')
    key_stakeholder = models.ForeignKey(Contact, on_delete=models.SET_NULL, null=True, blank=True, related_name='stakeholder_projects')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='projects')
    def __str__(self):
        return self.name


class ProjectKeyDate(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='key_dates')
    label = models.CharField(max_length=255)
    due_date = models.DateField()
    remarks = models.TextField(blank=True)

    def __str__(self):
        return f"{self.label} - {self.project.name}"


class Property(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('sold', 'Sold'),
        ('inactive', 'Inactive'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='properties')
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=512)
    purchase_date = models.DateField()
    purchase_price = models.DecimalField(max_digits=15, decimal_places=2)
    expected_rent = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')

    def __str__(self):
        return f"{self.name} ({self.project.name})"
