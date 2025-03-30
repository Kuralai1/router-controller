from django.db import models
from django.contrib.auth.models import User


class VirtualRouter(models.Model):
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='routers')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    ip_address = models.GenericIPAddressField(protocol='IPv4', default='192.168.1.1')
    subnet_mask = models.GenericIPAddressField(protocol='IPv4', default='255.255.255.0')
    admin_password = models.CharField(max_length=100, default='admin')
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name


class NetworkDevice(models.Model):
    VENDOR_CHOICES = [
        ('generic', 'Generic'),
        ('cisco', 'Cisco'),
        ('tp_link', 'TP-Link'),
        ('netgear', 'Netgear'),
        ('d_link', 'D-Link'),
        ('asus', 'Asus'),
    ]
    
    name = models.CharField(max_length=100)
    router = models.ForeignKey(VirtualRouter, on_delete=models.CASCADE, related_name='devices')
    mac_address = models.CharField(max_length=17, blank=True, null=True)  # Format: AA:BB:CC:DD:EE:FF
    ip_address = models.GenericIPAddressField(protocol='IPv4')
    vendor = models.CharField(max_length=50, choices=VENDOR_CHOICES, default='generic')
    serial_number = models.CharField(max_length=100, blank=True, null=True)
    hardware_version = models.CharField(max_length=50, blank=True, null=True)
    software_version = models.CharField(max_length=50, blank=True, null=True)
    connected_since = models.DateTimeField(auto_now_add=True)
    last_seen = models.DateTimeField(auto_now=True)
    is_online = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} ({self.ip_address})"


class RouterUser(models.Model):
    USER_TYPES = [
        ('admin', 'Administrator'),
        ('guest', 'Guest'),
        ('limited', 'Limited Access'),
    ]
    
    router = models.ForeignKey(VirtualRouter, on_delete=models.CASCADE, related_name='router_users')
    username = models.CharField(max_length=50)
    password = models.CharField(max_length=100)
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='guest')
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ('router', 'username')
    
    def __str__(self):
        return f"{self.username} ({self.user_type}) on {self.router.name}"


class NetworkConfiguration(models.Model):
    router = models.OneToOneField(VirtualRouter, on_delete=models.CASCADE, related_name='network_config')
    dhcp_enabled = models.BooleanField(default=True)
    dhcp_start_ip = models.GenericIPAddressField(protocol='IPv4', default='192.168.1.100')
    dhcp_end_ip = models.GenericIPAddressField(protocol='IPv4', default='192.168.1.200')
    dns_primary = models.GenericIPAddressField(protocol='IPv4', default='8.8.8.8')
    dns_secondary = models.GenericIPAddressField(protocol='IPv4', default='8.8.4.4')
    wifi_enabled = models.BooleanField(default=True)
    wifi_ssid = models.CharField(max_length=100, default='VirtualNetwork')
    wifi_password = models.CharField(max_length=100, default='password123')
    wifi_security = models.CharField(max_length=20, default='WPA2')
    
    def __str__(self):
        return f"Network Config for {self.router.name}"


class RouterLog(models.Model):
    LOG_TYPES = [
        ('info', 'Information'),
        ('warning', 'Warning'),
        ('error', 'Error'),
        ('security', 'Security Alert'),
        ('connection', 'Connection Event'),
    ]
    
    router = models.ForeignKey(VirtualRouter, on_delete=models.CASCADE, related_name='logs')
    timestamp = models.DateTimeField(auto_now_add=True)
    log_type = models.CharField(max_length=20, choices=LOG_TYPES)
    message = models.TextField()
    source_ip = models.GenericIPAddressField(protocol='IPv4', blank=True, null=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.log_type}: {self.message[:50]}..."