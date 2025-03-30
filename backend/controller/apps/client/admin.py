from django.contrib import admin
from .models import VirtualRouter, NetworkDevice, RouterUser, NetworkConfiguration, RouterLog


@admin.register(VirtualRouter)
class VirtualRouterAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'ip_address', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'ip_address', 'owner__username')
    date_hierarchy = 'created_at'


@admin.register(NetworkDevice)
class NetworkDeviceAdmin(admin.ModelAdmin):
    list_display = ('name', 'router', 'ip_address', 'vendor', 'is_online', 'last_seen')
    list_filter = ('is_online', 'vendor', 'router')
    search_fields = ('name', 'ip_address', 'mac_address', 'serial_number')
    date_hierarchy = 'connected_since'


@admin.register(RouterUser)
class RouterUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'router', 'user_type', 'is_active', 'created_at')
    list_filter = ('user_type', 'is_active', 'router')
    search_fields = ('username', 'router__name')
    date_hierarchy = 'created_at'


@admin.register(NetworkConfiguration)
class NetworkConfigurationAdmin(admin.ModelAdmin):
    list_display = ('router', 'dhcp_enabled', 'wifi_enabled', 'wifi_ssid')
    list_filter = ('dhcp_enabled', 'wifi_enabled')
    search_fields = ('router__name', 'wifi_ssid')


@admin.register(RouterLog)
class RouterLogAdmin(admin.ModelAdmin):
    list_display = ('router', 'log_type', 'timestamp', 'message')
    list_filter = ('log_type', 'timestamp', 'router')
    search_fields = ('message', 'router__name', 'source_ip')
    date_hierarchy = 'timestamp'
