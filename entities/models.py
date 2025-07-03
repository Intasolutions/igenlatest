from django.db import models

class Entity(models.Model):
    ENTITY_TYPES = [
        ('client', 'Client'),
        ('vendor', 'Vendor'),
        ('partner', 'Partner'),
    ]

    name = models.CharField(max_length=255, unique=True)
    entity_type = models.CharField(max_length=20, choices=ENTITY_TYPES)
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.entity_type})"
