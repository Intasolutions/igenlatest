from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet

# ✅ DRF router setup for Company CRUD operations
router = DefaultRouter()
router.register(r'', CompanyViewSet, basename='companies')

urlpatterns = router.urls  # ✅ This makes /api/companies/ point to CompanyViewSet
