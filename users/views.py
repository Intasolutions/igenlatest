from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.contrib.auth.hashers import make_password

from .models import User
from .serializers import UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    Handles all CRUD operations for users, including custom actions
    like password reset and deactivation.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        """
        Creates a new user. Let the serializer handle password hashing.
        """
        try:
            data = request.data.copy()

            # Ensure required fields are present
            if not data.get('user_id') or not data.get('password'):
                return Response(
                    {'detail': 'Both user_id and password are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Let serializer hash the password using set_password()
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'detail': f'Error creating user: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    def update(self, request, *args, **kwargs):
        """
        Updates user info. Serializer handles password hashing if provided.
        """
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)

            return Response(serializer.data)

        except Exception as e:
            return Response(
                {'detail': f'Error updating user: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'], url_path='deactivate')
    def deactivate(self, request, pk=None):
        """
        Deactivates a user (sets is_active=False).
        """
        try:
            user = self.get_object()
            user.is_active = False
            user.save()
            return Response({'detail': 'User deactivated successfully'})

        except Exception as e:
            return Response(
                {'detail': f'Error deactivating user: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'], url_path='reset-password')
    def reset_password(self, request, pk=None):
        """
        Resets a user's password (admin use).
        """
        try:
            user = self.get_object()
            new_password = request.data.get('password')

            if not new_password:
                return Response(
                    {'detail': 'Password is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user.set_password(new_password)  # 🔐 Use set_password here
            user.save()

            return Response({'detail': 'Password reset successfully'})

        except Exception as e:
            return Response(
                {'detail': f'Error resetting password: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
