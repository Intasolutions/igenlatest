# Generated by Django 5.2.3 on 2025-06-29 08:36

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('companies', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='BankAccount',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('account_name', models.CharField(max_length=255)),
                ('account_number', models.CharField(max_length=30)),
                ('bank_name', models.CharField(max_length=255)),
                ('ifsc', models.CharField(max_length=11)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bank_accounts', to='companies.company')),
            ],
            options={
                'unique_together': {('company', 'account_number')},
            },
        ),
    ]
