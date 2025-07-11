from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet, ClassifiedTransactionViewSet

router = DefaultRouter()
router.register(r'', TransactionViewSet, basename='transactions')
router.register(r'classified/', ClassifiedTransactionViewSet, basename='classified-transactions')


urlpatterns = router.urls
