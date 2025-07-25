import uuid
from django.db import models
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError
from companies.models import Company

class Contact(models.Model):
    INDIVIDUAL = 'Individual'
    COMPANY = 'Company'

    TYPE_CHOICES = [
        (INDIVIDUAL, 'Individual'),
        (COMPANY, 'Company'),
    ]

    STAKEHOLDER_TYPES = [
        ('Landlord', 'Landlord'),
        ('Tenant', 'Tenant'),
        ('Vendor', 'Vendor'),
        ('Buyer', 'Buyer'),
        ('Seller', 'Seller'),
        ('Broker', 'Broker'),
        ('Key Holder', 'Key Holder'),
        ('Project Stakeholder', 'Project Stakeholder'),
        ('Other', 'Other'),
    ]

    contact_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default=INDIVIDUAL)
    stakeholder_types = models.JSONField(default=list)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='contacts', null=True)

    phone = models.CharField(
        max_length=10,
        validators=[RegexValidator(r'^\d{10}$', message='Phone number must be exactly 10 digits')]
    )
    alternate_phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)

    address = models.TextField(blank=True, null=True)
    pan = models.CharField(max_length=15, unique=True, blank=True, null=True)
    gst = models.CharField(max_length=25, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    # Location info
    landmark = models.CharField(max_length=255, blank=True, null=True)
    pincode = models.CharField(max_length=10, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    district = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, default='Kerala')
    country = models.CharField(max_length=100, default='India')

    # ✅ Enable linking to projects and properties
    linked_properties = models.ManyToManyField('properties.Property', blank=True)
    linked_projects = models.ManyToManyField('projects.Project', blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        if self.type == self.COMPANY and not self.gst:
            raise ValidationError({'gst': 'GST number is required for contacts of type Company.'})
        if not self.stakeholder_types:
            raise ValidationError({'stakeholder_types': 'At least one stakeholder type must be selected.'})

    def __str__(self):
        return self.full_name
