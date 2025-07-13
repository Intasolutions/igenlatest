from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet, ClassifiedTransactionViewSet

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transactions')  # /api/transactions/transactions/
router.register(r'classified', ClassifiedTransactionViewSet, basename='classified')  # /api/transactions/classified/

urlpatterns = [
    path('', include(router.urls)),
]
