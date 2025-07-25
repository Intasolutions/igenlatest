from rest_framework.routers import DefaultRouter
from .views import ContractViewSet, ContractMilestoneViewSet

router = DefaultRouter()
router.register(r'contracts', ContractViewSet, basename='contract')
router.register(r'contract-milestones', ContractMilestoneViewSet, basename='contract-milestone')

urlpatterns = router.urls
