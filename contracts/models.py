from django.db import models

class Contract(models.Model):
    contract_number = models.CharField(max_length=100)
    title = models.CharField(max_length=255)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.contract_number} - {self.title}"
