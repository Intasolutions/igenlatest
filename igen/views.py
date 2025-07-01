from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from companies.models import Company
from banks.models import BankAccount
from cost_centres.models import CostCentre
from transaction_types.models import TransactionType
from transactions.models import Transaction
from users.models import User
from users.serializers import UserSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    Returns a summary of all key data points for the dashboard.
    """
    try:
        total_companies = Company.objects.count()
        total_banks = BankAccount.objects.count()
        total_cost_centres = CostCentre.objects.count()
        total_transaction_types = TransactionType.objects.count()
        total_transactions = Transaction.objects.count()
        total_credit = Transaction.objects.filter(transaction_type__is_credit=True).aggregate(total=models.Sum('amount'))['total'] or 0
        total_debit = Transaction.objects.filter(transaction_type__is_credit=False).aggregate(total=models.Sum('amount'))['total'] or 0

        return Response({
            'total_companies': total_companies,
            'total_banks': total_banks,
            'total_cost_centres': total_cost_centres,
            'total_transaction_types': total_transaction_types,
            'total_transactions': total_transactions,
            'total_credit': total_credit,
            'total_debit': total_debit,
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_list(request):
    """
    Returns a list of all users.
    """
    try:
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_user(request):
    """
    Creates a new user with proper password handling.
    """
    data = request.data.copy()
    password = data.pop('password', None)
    serializer = UserSerializer(data=data)

    if serializer.is_valid():
        user = serializer.save()
        if password:
            user.set_password(password)
            user.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

    # ADD THIS: print errors to console for debugging
    print("❌ User creation failed:", serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request, pk):
    """
    Deletes a user by ID.
    """
    try:
        user = User.objects.get(pk=pk)
        user.delete()
        return Response({'message': 'User deleted'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
