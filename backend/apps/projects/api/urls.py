# apps/projects/api/urls.py
from rest_framework.routers import DefaultRouter

from .views import ProjectViewSet

app_name = "projects"

router = DefaultRouter()
router.register("projects", ProjectViewSet, basename="project")

urlpatterns = router.urls
