import { useState, useEffect } from 'react';
import { networkConfigAPI } from '../../api';
import './NetworkSettings.css';

// Preset configurations for quick setup
const NETWORK_PRESETS = {
  home: {
    name: 'Home Network',
    dhcp_enabled: true,
    dhcp_start_ip: '192.168.1.100',
    dhcp_end_ip: '192.168.1.200',
    dns_primary: '8.8.8.8',
    dns_secondary: '8.8.4.4',
    wifi_enabled: true,
    wifi_ssid: 'HomeNetwork',
    wifi_security: 'WPA2'
  },
  office: {
    name: 'Office Network',
    dhcp_enabled: true,
    dhcp_start_ip: '10.0.0.100',
    dhcp_end_ip: '10.0.0.200',
    dns_primary: '1.1.1.1',
    dns_secondary: '1.0.0.1',
    wifi_enabled: true,
    wifi_ssid: 'OfficeNetwork',
    wifi_security: 'WPA3'
  },
  guest: {
    name: 'Guest Network',
    dhcp_enabled: true,
    dhcp_start_ip: '192.168.2.100',
    dhcp_end_ip: '192.168.2.200',
    dns_primary: '8.8.8.8',
    dns_secondary: '8.8.4.4',
    wifi_enabled: true,
    wifi_ssid: 'GuestNetwork',
    wifi_security: 'WPA2'
  }
};

const NetworkSettings = ({ routerId }) => {
  const [networkConfig, setNetworkConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [customPresets, setCustomPresets] = useState(() => {
    // Load custom presets from localStorage if available
    const savedPresets = localStorage.getItem('customNetworkPresets');
    return savedPresets ? JSON.parse(savedPresets) : {};
  });
  const [formData, setFormData] = useState({
    dhcp_enabled: true,
    dhcp_start_ip: '192.168.1.100',
    dhcp_end_ip: '192.168.1.200',
    dns_primary: '8.8.8.8',
    dns_secondary: '8.8.4.4',
    wifi_enabled: true,
    wifi_ssid: 'VirtualNetwork',
    wifi_password: 'password123',
    wifi_security: 'WPA2'
  });
  const [isEditing, setIsEditing] = useState(false);

  const fetchNetworkConfig = async () => {
    try {
      setLoading(true);
      const response = await networkConfigAPI.getByRouter(routerId);
      
      if (response.data.length > 0) {
        const config = response.data[0];
        setNetworkConfig(config);
        setFormData({
          dhcp_enabled: config.dhcp_enabled,
          dhcp_start_ip: config.dhcp_start_ip,
          dhcp_end_ip: config.dhcp_end_ip,
          dns_primary: config.dns_primary,
          dns_secondary: config.dns_secondary,
          wifi_enabled: config.wifi_enabled,
          wifi_ssid: config.wifi_ssid,
          wifi_password: '',  // Don't show the actual password for security
          wifi_security: config.wifi_security
        });
      } else {
        createDefaultConfig();
      }
      setError('');
    } catch (err) {
      setError('Failed to load network configuration. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultConfig = async () => {
    try {
      const defaultConfig = {
        router: routerId,
        dhcp_enabled: true,
        dhcp_start_ip: '192.168.1.100',
        dhcp_end_ip: '192.168.1.200',
        dns_primary: '8.8.8.8',
        dns_secondary: '8.8.4.4',
        wifi_enabled: true,
        wifi_ssid: 'VirtualNetwork',
        wifi_password: 'password123',
        wifi_security: 'WPA2'
      };
      
      const response = await networkConfigAPI.create(defaultConfig);
      setNetworkConfig(response.data);
      setFormData({
        ...defaultConfig,
        wifi_password: ''  // Don't show the actual password for security
      });
    } catch (err) {
      setError('Failed to create default network configuration. Please try again.');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNetworkConfig();
  }, [routerId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateIpAddress = (ip) => {
    const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    if (!ipRegex.test(ip)) return false;
    
    const octets = ip.split('.');
    for (let octet of octets) {
      const num = parseInt(octet, 10);
      if (num < 0 || num > 255) return false;
    }
    
    return true;
  };

  const validateDhcpRange = () => {
    if (!formData.dhcp_enabled) return true;
    
    const startIpParts = formData.dhcp_start_ip.split('.').map(Number);
    const endIpParts = formData.dhcp_end_ip.split('.').map(Number);
    
    for (let i = 0; i < 4; i++) {
      if (startIpParts[i] < endIpParts[i]) return true;
      if (startIpParts[i] > endIpParts[i]) return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setError('');
    setSuccessMessage('');
     
    const ipFields = ['dhcp_start_ip', 'dhcp_end_ip', 'dns_primary', 'dns_secondary'];
    for (let field of ipFields) {
      if (!validateIpAddress(formData[field])) {
        setError(`Invalid IP address format for ${field.replace('_', ' ')}`);
        return;
      }
    }
     
    if (!validateDhcpRange()) {
      setError('DHCP start IP must be less than or equal to end IP');
      return;
    }
     
    try {
      const configToUpdate = { ...formData };
      if (!configToUpdate.wifi_password) {
        delete configToUpdate.wifi_password;
      }
      
      await networkConfigAPI.update(networkConfig.id, {
        ...configToUpdate,
        router: routerId
      });
      
      setSuccessMessage('Network settings updated successfully!');
      setIsEditing(false);
      fetchNetworkConfig();
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError('Failed to update network configuration. Please try again.');
      console.error(err);
    }
  };

  const toggleDhcp = async () => {
    if (!networkConfig) return;
    
    try {
      await networkConfigAPI.toggleDhcp(networkConfig.id);
      fetchNetworkConfig();
    } catch (err) {
      setError('Failed to toggle DHCP. Please try again.');
      console.error(err);
    }
  };

  const toggleWifi = async () => {
    if (!networkConfig) return;
    
    try {
      await networkConfigAPI.toggleWifi(networkConfig.id);
      fetchNetworkConfig();
    } catch (err) {
      setError('Failed to toggle WiFi. Please try again.');
      console.error(err);
    }
  };

  if (loading && !networkConfig) {
    return <div className="loading">Loading network settings...</div>;
  }

  return (
    <div className="network-settings-container">
      <div className="settings-header">
        <h2>Network Settings</h2>
        {!isEditing && (
          <button 
            className="edit-settings-btn"
            onClick={() => setIsEditing(true)}
          >
            Edit Settings
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {networkConfig && !isEditing ? (
        <div className="settings-display">
          <div className="settings-card">
            <div className="card-header">
              <h3>DHCP Settings</h3>
              <button 
                className={`toggle-btn ${networkConfig.dhcp_enabled ? 'enabled' : 'disabled'}`}
                onClick={toggleDhcp}
              >
                {networkConfig.dhcp_enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
            <div className="card-content">
              <div className="setting-item">
                <span className="setting-label">DHCP Range:</span>
                <span className="setting-value">
                  {networkConfig.dhcp_start_ip} - {networkConfig.dhcp_end_ip}
                </span>
              </div>
              <div className="setting-item">
                <span className="setting-label">Primary DNS:</span>
                <span className="setting-value">{networkConfig.dns_primary}</span>
              </div>
              <div className="setting-item">
                <span className="setting-label">Secondary DNS:</span>
                <span className="setting-value">{networkConfig.dns_secondary}</span>
              </div>
            </div>
          </div>

          <div className="settings-card">
            <div className="card-header">
              <h3>WiFi Settings</h3>
              <button 
                className={`toggle-btn ${networkConfig.wifi_enabled ? 'enabled' : 'disabled'}`}
                onClick={toggleWifi}
              >
                {networkConfig.wifi_enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
            <div className="card-content">
              <div className="setting-item">
                <span className="setting-label">SSID:</span>
                <span className="setting-value">{networkConfig.wifi_ssid}</span>
              </div>
              <div className="setting-item">
                <span className="setting-label">Password:</span>
                <span className="setting-value">••••••••</span>
              </div>
              <div className="setting-item">
                <span className="setting-label">Security:</span>
                <span className="setting-value">{networkConfig.wifi_security}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form className="settings-form" onSubmit={handleSubmit}>
          <div className="presets-section">
            <h3>Quick Setup</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="preset-selector">Load Network Preset</label>
                <select 
                  id="preset-selector" 
                  onChange={(e) => {
                    if (e.target.value) {
                      const isCustom = e.target.value.startsWith('custom-');
                      const presetKey = isCustom ? e.target.value.replace('custom-', '') : e.target.value;
                      const preset = isCustom ? customPresets[presetKey] : NETWORK_PRESETS[e.target.value];
                      
                      setFormData({
                        ...preset,
                        wifi_password: formData.wifi_password
                      });
                      setSuccessMessage(`Loaded ${preset.name} preset. Don't forget to save your changes!`);
                      setTimeout(() => {
                        setSuccessMessage('');
                      }, 3000);
                    }
                  }}
                  defaultValue=""
                >
                  <option value="">Select a preset...</option>
                  <optgroup label="Built-in Presets">
                    <option value="home">{NETWORK_PRESETS.home.name}</option>
                    <option value="office">{NETWORK_PRESETS.office.name}</option>
                    <option value="guest">{NETWORK_PRESETS.guest.name}</option>
                  </optgroup>
                  {Object.keys(customPresets).length > 0 && (
                    <optgroup label="Custom Presets">
                      {Object.keys(customPresets).map(key => (
                        <option key={key} value={`custom-${key}`}>{customPresets[key].name}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
              <div className="form-group">
                <label>&nbsp;</label>
                <button 
                  type="button" 
                  className="save-preset-btn"
                  onClick={() => setShowSavePresetModal(true)}
                >
                  Save Current as Preset
                </button>
              </div>
            </div>
            
            {/* Custom Presets Management */}
            {Object.keys(customPresets).length > 0 && (
              <div className="custom-presets-manager">
                <h4>Manage Custom Presets</h4>
                <div className="custom-presets-list">
                  {Object.keys(customPresets).map(key => (
                    <div key={key} className="custom-preset-item">
                      <span className="preset-name">{customPresets[key].name}</span>
                      <button 
                        type="button" 
                        className="delete-preset-btn"
                        onClick={() => deleteCustomPreset(key)}
                        title="Delete preset"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="form-section">
            <h3>DHCP Settings</h3>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="dhcp_enabled"
                  checked={formData.dhcp_enabled}
                  onChange={handleChange}
                />
                Enable DHCP
              </label>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dhcp_start_ip">Start IP</label>
                <input
                  type="text"
                  id="dhcp_start_ip"
                  name="dhcp_start_ip"
                  value={formData.dhcp_start_ip}
                  onChange={handleChange}
                  required
                  pattern="^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$"
                  title="Please enter a valid IPv4 address"
                  disabled={!formData.dhcp_enabled}
                />
              </div>
              <div className="form-group">
                <label htmlFor="dhcp_end_ip">End IP</label>
                <input
                  type="text"
                  id="dhcp_end_ip"
                  name="dhcp_end_ip"
                  value={formData.dhcp_end_ip}
                  onChange={handleChange}
                  required
                  pattern="^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$"
                  title="Please enter a valid IPv4 address"
                  disabled={!formData.dhcp_enabled}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dns_primary">Primary DNS</label>
                <input
                  type="text"
                  id="dns_primary"
                  name="dns_primary"
                  value={formData.dns_primary}
                  onChange={handleChange}
                  required
                  pattern="^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$"
                  title="Please enter a valid IPv4 address"
                />
              </div>
              <div className="form-group">
                <label htmlFor="dns_secondary">Secondary DNS</label>
                <input
                  type="text"
                  id="dns_secondary"
                  name="dns_secondary"
                  value={formData.dns_secondary}
                  onChange={handleChange}
                  required
                  pattern="^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$"
                  title="Please enter a valid IPv4 address"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>WiFi Settings</h3>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="wifi_enabled"
                  checked={formData.wifi_enabled}
                  onChange={handleChange}
                />
                Enable WiFi
              </label>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="wifi_ssid">SSID</label>
                <input
                  type="text"
                  id="wifi_ssid"
                  name="wifi_ssid"
                  value={formData.wifi_ssid}
                  onChange={handleChange}
                  required
                  disabled={!formData.wifi_enabled}
                />
              </div>
              <div className="form-group">
                <label htmlFor="wifi_security">Security</label>
                <select
                  id="wifi_security"
                  name="wifi_security"
                  value={formData.wifi_security}
                  onChange={handleChange}
                  disabled={!formData.wifi_enabled}
                >
                  <option value="None">None</option>
                  <option value="WEP">WEP</option>
                  <option value="WPA">WPA</option>
                  <option value="WPA2">WPA2</option>
                  <option value="WPA3">WPA3</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="wifi_password">Password {networkConfig ? '(leave blank to keep current)' : ''}</label>
              <input
                type="password"
                id="wifi_password"
                name="wifi_password"
                value={formData.wifi_password}
                onChange={handleChange}
                required={!networkConfig}
                disabled={!formData.wifi_enabled}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="save-btn">Save Settings</button>
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => {
                setIsEditing(false);
                fetchNetworkConfig();
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default NetworkSettings;