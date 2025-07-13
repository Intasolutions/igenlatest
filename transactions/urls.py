from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet, ClassifiedTransactionViewSet

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transactions')
router.register(r'classified-transactions', ClassifiedTransactionViewSet, basename='classified-transactions')

urlpatterns = [
    path('', include(router.urls)),
]
