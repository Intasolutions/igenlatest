from rest_framework.routers import DefaultRouter
from .views import EntityViewSet

router = DefaultRouter()
router.register(r'', EntityViewSet, basename='entities')

urlpatterns = router.urls
