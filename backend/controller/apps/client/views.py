from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import VirtualRouter, NetworkDevice, RouterUser, NetworkConfiguration, RouterLog
from .serializers import (
    VirtualRouterSerializer, NetworkDeviceSerializer, RouterUserSerializer,
    NetworkConfigurationSerializer, RouterLogSerializer
)


class VirtualRouterViewSet(viewsets.ModelViewSet):
    serializer_class = VirtualRouterSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return VirtualRouter.objects.filter(owner=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['get'])
    def dashboard(self, request, pk=None):
        router = self.get_object()
        devices = NetworkDevice.objects.filter(router=router)
        logs = RouterLog.objects.filter(router=router)[:10]  # Получать последние 10 логов
        
        try:
            network_config = NetworkConfiguration.objects.get(router=router)
            config_serializer = NetworkConfigurationSerializer(network_config)
            config_data = config_serializer.data
        except NetworkConfiguration.DoesNotExist:
            config_data = {"message": "Network configuration not found"}
        
        online_devices = devices.filter(is_online=True).count()

        return Response({
            "router": VirtualRouterSerializer(router).data,
            "devices": {
                "total": devices.count(),
                "online": online_devices
            },
            "network_config": config_data,
            "recent_logs": RouterLogSerializer(logs, many=True).data
        })


class NetworkDeviceViewSet(viewsets.ModelViewSet):
    serializer_class = NetworkDeviceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        router_id = self.request.query_params.get('router', None)
        if router_id:
            return NetworkDevice.objects.filter(router_id=router_id, router__owner=self.request.user)
        return NetworkDevice.objects.filter(router__owner=self.request.user)
    
    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        device = self.get_object()
        device.is_online = not device.is_online
        device.save()
        
        status_str = "online" if device.is_online else "offline"
        RouterLog.objects.create(
            router=device.router,
            log_type="connection",
            message=f"Device {device.name} ({device.ip_address}) is now {status_str}"
        )
        
        return Response({"status": status_str})


class RouterUserViewSet(viewsets.ModelViewSet):
    serializer_class = RouterUserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        router_id = self.request.query_params.get('router', None)
        if router_id:
            return RouterUser.objects.filter(router_id=router_id, router__owner=self.request.user)
        return RouterUser.objects.filter(router__owner=self.request.user)


class NetworkConfigurationViewSet(viewsets.ModelViewSet):
    serializer_class = NetworkConfigurationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return NetworkConfiguration.objects.filter(router__owner=self.request.user)
    
    @action(detail=True, methods=['post'])
    def toggle_wifi(self, request, pk=None):
        config = self.get_object()
        config.wifi_enabled = not config.wifi_enabled
        config.save()
        
        status_str = "enabled" if config.wifi_enabled else "disabled"
        RouterLog.objects.create(
            router=config.router,
            log_type="info",
            message=f"WiFi {status_str} on router {config.router.name}"
        )
        
        return Response({"wifi_status": status_str})
    
    @action(detail=True, methods=['post'])
    def toggle_dhcp(self, request, pk=None):
        config = self.get_object()
        config.dhcp_enabled = not config.dhcp_enabled
        config.save()
        
        status_str = "enabled" if config.dhcp_enabled else "disabled"
        RouterLog.objects.create(
            router=config.router,
            log_type="info",
            message=f"DHCP {status_str} on router {config.router.name}"
        )
        
        return Response({"dhcp_status": status_str})


class RouterLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = RouterLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        router_id = self.request.query_params.get('router', None)
        if router_id:
            return RouterLog.objects.filter(router_id=router_id, router__owner=self.request.user)
        return RouterLog.objects.filter(router__owner=self.request.user)