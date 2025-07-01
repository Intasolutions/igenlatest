from rest_framework import viewsets
from .models import BankAccount
from .serializers import BankAccountSerializer
from users.permissions import IsSuperUser

class BankAccountViewSet(viewsets.ModelViewSet):
    queryset = BankAccount.objects.all()
    serializer_class = BankAccountSerializer
    permission_classes = [IsSuperUser]
