from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from . import views

router = DefaultRouter()
router.register(r'routers', views.VirtualRouterViewSet, basename='router')
router.register(r'devices', views.NetworkDeviceViewSet, basename='device')
router.register(r'router-users', views.RouterUserViewSet, basename='router-user')
router.register(r'network-configs', views.NetworkConfigurationViewSet, basename='network-config')
router.register(r'logs', views.RouterLogViewSet, basename='log')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/', obtain_auth_token, name='api_token_auth'),  # Для токена аутентификации
]