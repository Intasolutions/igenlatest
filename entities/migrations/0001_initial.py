# Generated by Django 5.2.3 on 2025-07-01 18:40

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Entity',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, unique=True)),
                ('entity_type', models.CharField(choices=[('client', 'Client'), ('vendor', 'Vendor'), ('partner', 'Partner')], max_length=20)),
                ('contact_email', models.EmailField(blank=True, max_length=254, null=True)),
                ('contact_phone', models.CharField(blank=True, max_length=20, null=True)),
                ('address', models.TextField(blank=True)),
                ('notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
