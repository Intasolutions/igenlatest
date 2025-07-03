

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('banks', '0001_initial'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='bankaccount',
            unique_together=set(),
        ),
        migrations.AlterField(
            model_name='bankaccount',
            name='account_number',
            field=models.CharField(max_length=30, unique=True),
        ),
    ]
