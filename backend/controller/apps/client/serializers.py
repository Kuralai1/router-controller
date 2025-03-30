from rest_framework import serializers
from .models import VirtualRouter, NetworkDevice, RouterUser, NetworkConfiguration, RouterLog
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class VirtualRouterSerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')
    
    class Meta:
        model = VirtualRouter
        fields = ['id', 'name', 'owner', 'owner_username', 'created_at', 'updated_at', 
                  'ip_address', 'subnet_mask', 'admin_password', 'is_active']
        read_only_fields = ['id', 'owner', 'owner_username', 'created_at', 'updated_at']


class NetworkDeviceSerializer(serializers.ModelSerializer):
    router_name = serializers.ReadOnlyField(source='router.name')
    uptime = serializers.SerializerMethodField()
    
    class Meta:
        model = NetworkDevice
        fields = ['id', 'name', 'router', 'router_name', 'mac_address', 'ip_address', 
                  'vendor', 'serial_number', 'hardware_version', 'software_version', 
                  'connected_since', 'last_seen', 'is_online', 'uptime']
        read_only_fields = ['id', 'router_name', 'connected_since', 'last_seen', 'uptime']
    
    def get_uptime(self, obj):
        if not obj.is_online:
            return 0
        import datetime
        from django.utils import timezone
        now = timezone.now()
        return int((now - obj.connected_since).total_seconds())


class RouterUserSerializer(serializers.ModelSerializer):
    router_name = serializers.ReadOnlyField(source='router.name')
    
    class Meta:
        model = RouterUser
        fields = ['id', 'router', 'router_name', 'username', 'password', 'user_type', 
                  'created_at', 'last_login', 'is_active']
        read_only_fields = ['id', 'router_name', 'created_at']
        extra_kwargs = {
            'password': {'write_only': True}
        }


class NetworkConfigurationSerializer(serializers.ModelSerializer):
    router_name = serializers.ReadOnlyField(source='router.name')
    
    class Meta:
        model = NetworkConfiguration
        fields = ['id', 'router', 'router_name', 'dhcp_enabled', 'dhcp_start_ip', 'dhcp_end_ip', 
                  'dns_primary', 'dns_secondary', 'wifi_enabled', 'wifi_ssid', 
                  'wifi_password', 'wifi_security']
        read_only_fields = ['id', 'router_name']
        extra_kwargs = {
            'wifi_password': {'write_only': True}
        }


class RouterLogSerializer(serializers.ModelSerializer):
    router_name = serializers.ReadOnlyField(source='router.name')
    
    class Meta:
        model = RouterLog
        fields = ['id', 'router', 'router_name', 'timestamp', 'log_type', 'message', 'source_ip']
        read_only_fields = ['id', 'router_name', 'timestamp']