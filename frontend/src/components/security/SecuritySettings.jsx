import { useState, useEffect } from 'react';
import './SecuritySettings.css';

// This would typically come from an API
const securityAPI = {
  getSettings: (routerId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            firewall_enabled: true,
            port_forwarding: [
              { id: 1, name: 'HTTP Server', protocol: 'TCP', external_port: 80, internal_port: 8080, internal_ip: '192.168.1.100', enabled: true },
              { id: 2, name: 'Game Server', protocol: 'UDP', external_port: 7777, internal_port: 7777, internal_ip: '192.168.1.101', enabled: false },
            ],
            blocked_devices: [
              { id: 1, name: 'Unknown Device', mac_address: '00:11:22:33:44:55', reason: 'Suspicious activity' },
            ],
            parental_controls_enabled: false,
            vpn_enabled: false,
            dmz_enabled: false,
            dmz_ip: '192.168.1.150'
          }
        });
      }, 500);
    });
  },
  updateSettings: (routerId, settings) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: settings });
      }, 500);
    });
  },
  addPortForwarding: (routerId, rule) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          data: { 
            ...rule, 
            id: Math.floor(Math.random() * 1000) 
          } 
        });
      }, 500);
    });
  },
  deletePortForwarding: (routerId, ruleId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 500);
    });
  },
  addBlockedDevice: (routerId, device) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          data: { 
            ...device, 
            id: Math.floor(Math.random() * 1000) 
          } 
        });
      }, 500);
    });
  },
  removeBlockedDevice: (routerId, deviceId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 500);
    });
  }
};

const SecuritySettings = ({ routerId }) => {
  const [securitySettings, setSecuritySettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeSection, setActiveSection] = useState('firewall');
  
  const [showPortForwardingForm, setShowPortForwardingForm] = useState(false);
  const [portForwardingForm, setPortForwardingForm] = useState({
    name: '',
    protocol: 'TCP',
    external_port: '',
    internal_port: '',
    internal_ip: '',
    enabled: true
  });
  
  // Blocked device form state
  const [showBlockedDeviceForm, setShowBlockedDeviceForm] = useState(false);
  const [blockedDeviceForm, setBlockedDeviceForm] = useState({
    name: '',
    mac_address: '',
    reason: ''
  });

  const fetchSecuritySettings = async () => {
    try {
      setLoading(true);
      const response = await securityAPI.getSettings(routerId);
      setSecuritySettings(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load security settings. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecuritySettings();
  }, [routerId]);

  const handleToggleSetting = async (setting) => {
    try {
      const updatedSettings = { 
        ...securitySettings,
        [setting]: !securitySettings[setting] 
      };
      
      await securityAPI.updateSettings(routerId, updatedSettings);
      setSecuritySettings(updatedSettings);
      
      setSuccessMessage(`${setting.replace('_', ' ')} ${updatedSettings[setting] ? 'enabled' : 'disabled'} successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(`Failed to update ${setting.replace('_', ' ')}. Please try again.`);
      console.error(err);
    }
  };

  const handlePortForwardingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPortForwardingForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddPortForwarding = async (e) => {
    e.preventDefault();
    try {
      const response = await securityAPI.addPortForwarding(routerId, portForwardingForm);
      setSecuritySettings(prev => ({
        ...prev,
        port_forwarding: [...prev.port_forwarding, response.data]
      }));
      
      setPortForwardingForm({
        name: '',
        protocol: 'TCP',
        external_port: '',
        internal_port: '',
        internal_ip: '',
        enabled: true
      });
      setShowPortForwardingForm(false);
      
      setSuccessMessage('Port forwarding rule added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to add port forwarding rule. Please try again.');
      console.error(err);
    }
  };

  const handleDeletePortForwarding = async (ruleId) => {
    try {
      await securityAPI.deletePortForwarding(routerId, ruleId);
      setSecuritySettings(prev => ({
        ...prev,
        port_forwarding: prev.port_forwarding.filter(rule => rule.id !== ruleId)
      }));
      
      setSuccessMessage('Port forwarding rule deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to delete port forwarding rule. Please try again.');
      console.error(err);
    }
  };

  const handleBlockedDeviceChange = (e) => {
    const { name, value } = e.target;
    setBlockedDeviceForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddBlockedDevice = async (e) => {
    e.preventDefault();
    try {
      const response = await securityAPI.addBlockedDevice(routerId, blockedDeviceForm);
      setSecuritySettings(prev => ({
        ...prev,
        blocked_devices: [...prev.blocked_devices, response.data]
      }));
      
      setBlockedDeviceForm({
        name: '',
        mac_address: '',
        reason: ''
      });
      setShowBlockedDeviceForm(false);
      
      setSuccessMessage('Device blocked successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to block device. Please try again.');
      console.error(err);
    }
  };

  const handleRemoveBlockedDevice = async (deviceId) => {
    try {
      await securityAPI.removeBlockedDevice(routerId, deviceId);
      setSecuritySettings(prev => ({
        ...prev,
        blocked_devices: prev.blocked_devices.filter(device => device.id !== deviceId)
      }));
      
      setSuccessMessage('Device unblocked successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to unblock device. Please try again.');
      console.error(err);
    }
  };

  if (loading && !securitySettings) {
    return <div className="loading">Loading security settings...</div>;
  }

  return (
    <div className="security-settings-container">
      <div className="settings-header">
        <h2>Security Settings</h2>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="security-tabs">
        <button 
          className={`security-tab ${activeSection === 'firewall' ? 'active' : ''}`}
          onClick={() => setActiveSection('firewall')}
        >
          Firewall
        </button>
        <button 
          className={`security-tab ${activeSection === 'port-forwarding' ? 'active' : ''}`}
          onClick={() => setActiveSection('port-forwarding')}
        >
          Port Forwarding
        </button>
        <button 
          className={`security-tab ${activeSection === 'access-control' ? 'active' : ''}`}
          onClick={() => setActiveSection('access-control')}
        >
          Access Control
        </button>
        <button 
          className={`security-tab ${activeSection === 'advanced' ? 'active' : ''}`}
          onClick={() => setActiveSection('advanced')}
        >
          Advanced
        </button>
      </div>

      <div className="security-content">
        {activeSection === 'firewall' && (
          <div className="firewall-section">
            <div className="section-header">
              <h3>Firewall Settings</h3>
              <div className="toggle-switch">
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={securitySettings.firewall_enabled} 
                    onChange={() => handleToggleSetting('firewall_enabled')}
                  />
                  <span className="slider round"></span>
                </label>
                <span className="toggle-label">
                  {securitySettings.firewall_enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
            
            <div className="firewall-info">
              <p>The firewall protects your network from unauthorized access and cyber threats.</p>
              <p>When enabled, the firewall monitors incoming and outgoing traffic based on predetermined security rules.</p>
            </div>
            
            <div className="firewall-features">
              <div className="feature-card">
                <h4>DoS Protection</h4>
                <p>Protects against Denial of Service attacks</p>
                <div className="feature-status enabled">Enabled</div>
              </div>
              <div className="feature-card">
                <h4>SYN Flood Protection</h4>
                <p>Prevents SYN flood attacks</p>
                <div className="feature-status enabled">Enabled</div>
              </div>
              <div className="feature-card">
                <h4>ICMP Flood Protection</h4>
                <p>Prevents ping flood attacks</p>
                <div className="feature-status enabled">Enabled</div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'port-forwarding' && (
          <div className="port-forwarding-section">
            <div className="section-header">
              <h3>Port Forwarding</h3>
              <button 
                className="add-rule-btn"
                onClick={() => setShowPortForwardingForm(!showPortForwardingForm)}
              >
                {showPortForwardingForm ? 'Cancel' : 'Add Rule'}
              </button>
            </div>
            
            {showPortForwardingForm && (
              <div className="port-forwarding-form">
                <h4>Add Port Forwarding Rule</h4>
                <form onSubmit={handleAddPortForwarding}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Rule Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={portForwardingForm.name}
                        onChange={handlePortForwardingChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="protocol">Protocol</label>
                      <select
                        id="protocol"
                        name="protocol"
                        value={portForwardingForm.protocol}
                        onChange={handlePortForwardingChange}
                      >
                        <option value="TCP">TCP</option>
                        <option value="UDP">UDP</option>
                        <option value="TCP/UDP">TCP/UDP</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="external_port">External Port</label>
                      <input
                        type="number"
                        id="external_port"
                        name="external_port"
                        value={portForwardingForm.external_port}
                        onChange={handlePortForwardingChange}
                        min="1"
                        max="65535"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="internal_port">Internal Port</label>
                      <input
                        type="number"
                        id="internal_port"
                        name="internal_port"
                        value={portForwardingForm.internal_port}
                        onChange={handlePortForwardingChange}
                        min="1"
                        max="65535"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="internal_ip">Internal IP</label>
                      <input
                        type="text"
                        id="internal_ip"
                        name="internal_ip"
                        value={portForwardingForm.internal_ip}
                        onChange={handlePortForwardingChange}
                        pattern="^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$"
                        title="Please enter a valid IPv4 address"
                        required
                      />
                    </div>
                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          name="enabled"
                          checked={portForwardingForm.enabled}
                          onChange={handlePortForwardingChange}
                        />
                        Enable Rule
                      </label>
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="save-btn">Add Rule</button>
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={() => setShowPortForwardingForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {securitySettings.port_forwarding.length === 0 ? (
              <div className="no-rules">
                <p>No port forwarding rules configured.</p>
                <p>Click "Add Rule" to create a new port forwarding rule.</p>
              </div>
            ) : (
              <div className="rules-table-container">
                <table className="rules-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Protocol</th>
                      <th>External Port</th>
                      <th>Internal Port</th>
                      <th>Internal IP</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {securitySettings.port_forwarding.map(rule => (
                      <tr key={rule.id}>
                        <td>{rule.name}</td>
                        <td>{rule.protocol}</td>
                        <td>{rule.external_port}</td>
                        <td>{rule.internal_port}</td>
                        <td>{rule.internal_ip}</td>
                        <td>
                          <span className={`status-badge ${rule.enabled ? 'enabled' : 'disabled'}`}>
                            {rule.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeletePortForwarding(rule.id)}
                            title="Delete Rule"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeSection === 'access-control' && (
          <div className="access-control-section">
            <div className="section-header">
              <h3>Access Control</h3>
              <button 
                className="add-device-btn"
                onClick={() => setShowBlockedDeviceForm(!showBlockedDeviceForm)}
              >
                {showBlockedDeviceForm ? 'Cancel' : 'Block Device'}
              </button>
            </div>
            
            {showBlockedDeviceForm && (
              <div className="blocked-device-form">
                <h4>Block Device</h4>
                <form onSubmit={handleAddBlockedDevice}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="device-name">Device Name</label>
                      <input
                        type="text"
                        id="device-name"
                        name="name"
                        value={blockedDeviceForm.name}
                        onChange={handleBlockedDeviceChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="mac-address">MAC Address</label>
                      <input
                        type="text"
                        id="mac-address"
                        name="mac_address"
                        value={blockedDeviceForm.mac_address}
                        onChange={handleBlockedDeviceChange}
                        pattern="^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
                        title="Please enter a valid MAC address (format: XX:XX:XX:XX:XX:XX)"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="reason">Reason (Optional)</label>
                    <input
                      type="text"
                      id="reason"
                      name="reason"
                      value={blockedDeviceForm.reason}
                      onChange={handleBlockedDeviceChange}
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="save-btn">Block Device</button>
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={() => setShowBlockedDeviceForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            <div className="parental-controls">
              <div className="control-header">
                <h4>Parental Controls</h4>
                <div className="toggle-switch">
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={securitySettings.parental_controls_enabled} 
                      onChange={() => handleToggleSetting('parental_controls_enabled')}
                    />
                    <span className="slider round"></span>
                  </label>
                  <span className="toggle-label">
                    {securitySettings.parental_controls_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
              <p>Parental controls allow you to restrict access to certain websites and set time limits for internet usage.</p>
            </div>
            
            <h4>Blocked Devices</h4>
            {securitySettings.blocked_devices.length === 0 ? (
              <div className="no-devices">
                <p>No devices are currently blocked.</p>
              </div>
            ) : (
              <div className="blocked-devices-table-container">
                <table className="blocked-devices-table">
                  <thead>
                    <tr>
                      <th>Device Name</th>
                      <th>MAC Address</th>
                      <th>Reason</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {securitySettings.blocked_devices.map(device => (
                      <tr key={device.id}>
                        <td>{device.name}</td>
                        <td>{device.mac_address}</td>
                        <td>{device.reason || 'N/A'}</td>
                        <td className="actions-cell">
                          <button 
                            className="unblock-btn"
                            onClick={() => handleRemoveBlockedDevice(device.id)}
                            title="Unblock Device"
                          >
                            Unblock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeSection === 'advanced' && (
          <div className="advanced-section">
            <div className="advanced-option">
              <div className="option-header">
                <h4>VPN Server</h4>
                <div className="toggle-switch">
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={securitySettings.vpn_enabled} 
                      onChange={() => handleToggleSetting('vpn_enabled')}
                    />
                    <span className="slider round"></span>
                  </label>
                  <span className="toggle-label">
                    {securitySettings.vpn_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
              <p>Enable VPN server functionality to allow secure remote access to your network.</p>
            </div>
            
            <div className="advanced-option">
              <div className="option-header">
                <h4>DMZ Host</h4>
                <div className="toggle-switch">
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={securitySettings.dmz_enabled} 
                      onChange={() => handleToggleSetting('dmz_enabled')}
                    />
                    <span className="slider round"></span>
                  </label>
                  <span className="toggle-label">
                    {securitySettings.dmz_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
              <p>DMZ exposes one computer to the internet, bypassing the firewall. Use with caution.</p>
              
              <div className="form-group dmz-ip-group">
                <label htmlFor="dmz-ip">DMZ IP Address</label>
                <input
                  type="text"
                  id="dmz-ip"
                  value={securitySettings.dmz_ip}
                  disabled={!securitySettings.dmz_enabled}
                  onChange={(e) => {
                    setSecuritySettings(prev => ({
                      ...prev,
                      dmz_ip: e.target.value
                    }));
                  }}
                  pattern="^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$"
                  title="Please enter a valid IPv4 address"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecuritySettings;