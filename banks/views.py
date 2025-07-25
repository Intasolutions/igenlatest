from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import BankAccount
from .serializers import BankAccountSerializer

class BankAccountViewSet(viewsets.ModelViewSet):
    serializer_class = BankAccountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        base_queryset = BankAccount.objects.filter(is_active=True)

        # SUPER_USER sees all active bank accounts
        if user.role == 'SUPER_USER':
            return base_queryset

        # ACCOUNTANT sees bank accounts from their assigned companies
        elif user.role == 'ACCOUNTANT':
            return base_queryset.filter(company__in=user.companies.all())

        # Optional: CENTER_HEAD logic
        # elif user.role == 'CENTER_HEAD':
        #     return base_queryset.filter(company__in=user.companies.all())

        return BankAccount.objects.none()

    @action(detail=True, methods=['patch'], url_path='deactivate')
    def deactivate(self, request, pk=None):
        """
        Soft delete (deactivate) a bank account.
        """
        bank = self.get_object()
        bank.is_active = False
        bank.save()
        return Response({'status': 'Bank account deactivated'}, status=status.HTTP_200_OK)
