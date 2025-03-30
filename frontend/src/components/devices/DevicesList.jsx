import { useState, useEffect } from 'react';
import { devicesAPI } from '../../api';
import './DevicesList.css';

const DevicesList = ({ routerId }) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    ip_address: '',
    mac_address: '',
    vendor: 'generic',
    serial_number: '',
    hardware_version: '',
    software_version: ''
  });

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await devicesAPI.getAll(routerId);
      setDevices(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load devices. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [routerId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await devicesAPI.create({
        ...formData,
        router: routerId
      });
      setFormData({
        name: '',
        ip_address: '',
        mac_address: '',
        vendor: 'generic',
        serial_number: '',
        hardware_version: '',
        software_version: ''
      });
      setShowCreateForm(false);
      fetchDevices();
    } catch (err) {
      setError('Failed to create device. Please try again.');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      try {
        await devicesAPI.delete(id);
        fetchDevices();
      } catch (err) {
        setError('Failed to delete device. Please try again.');
        console.error(err);
      }
    }
  };

  const toggleDeviceStatus = async (id) => {
    try {
      await devicesAPI.toggleStatus(id);
      fetchDevices();
    } catch (err) {
      setError('Failed to update device status. Please try again.');
      console.error(err);
    }
  };

  const formatUptime = (seconds) => {
    if (seconds === 0) return 'Offline';
    
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    
    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0 || days > 0) result += `${hours}h `;
    result += `${minutes}m`;
    
    return result;
  };

  if (loading && devices.length === 0) {
    return <div className="loading">Loading devices...</div>;
  }

  return (
    <div className="devices-container">
      <div className="devices-header">
        <h2>Connected Devices</h2>
        <button 
          className="create-device-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Add Device'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showCreateForm && (
        <div className="create-device-form">
          <h3>Add New Device</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Device Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="ip_address">IP Address</label>
                <input
                  type="text"
                  id="ip_address"
                  name="ip_address"
                  value={formData.ip_address}
                  onChange={handleChange}
                  required
                  pattern="^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$"
                  title="Please enter a valid IPv4 address"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="mac_address">MAC Address</label>
                <input
                  type="text"
                  id="mac_address"
                  name="mac_address"
                  value={formData.mac_address}
                  onChange={handleChange}
                  pattern="^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
                  title="Please enter a valid MAC address (format: XX:XX:XX:XX:XX:XX)"
                />
              </div>
              <div className="form-group">
                <label htmlFor="vendor">Vendor</label>
                <select
                  id="vendor"
                  name="vendor"
                  value={formData.vendor}
                  onChange={handleChange}
                >
                  <option value="generic">Generic</option>
                  <option value="cisco">Cisco</option>
                  <option value="tp_link">TP-Link</option>
                  <option value="netgear">Netgear</option>
                  <option value="d_link">D-Link</option>
                  <option value="asus">Asus</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="serial_number">Serial Number</label>
                <input
                  type="text"
                  id="serial_number"
                  name="serial_number"
                  value={formData.serial_number}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="hardware_version">Hardware Version</label>
                <input
                  type="text"
                  id="hardware_version"
                  name="hardware_version"
                  value={formData.hardware_version}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="software_version">Software Version</label>
                <input
                  type="text"
                  id="software_version"
                  name="software_version"
                  value={formData.software_version}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit" className="submit-btn">Add Device</button>
          </form>
        </div>
      )}

      {devices.length === 0 ? (
        <div className="no-devices">
          <p>No devices connected to this router.</p>
          <p>Click "Add Device" to add a virtual device.</p>
        </div>
      ) : (
        <div className="devices-table-container">
          <table className="devices-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Name</th>
                <th>IP Address</th>
                <th>MAC Address</th>
                <th>Vendor</th>
                <th>Uptime</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {devices.map(device => (
                <tr key={device.id} className={device.is_online ? 'online' : 'offline'}>
                  <td>
                    <span className={`status-dot ${device.is_online ? 'online' : 'offline'}`}></span>
                    {device.is_online ? 'Online' : 'Offline'}
                  </td>
                  <td>{device.name}</td>
                  <td>{device.ip_address}</td>
                  <td>{device.mac_address || 'N/A'}</td>
                  <td>{device.vendor}</td>
                  <td>{formatUptime(device.uptime)}</td>
                  <td className="actions-cell">
                    <button 
                      className="toggle-btn"
                      onClick={() => toggleDeviceStatus(device.id)}
                      title={device.is_online ? 'Set Offline' : 'Set Online'}
                    >
                      {device.is_online ? 'Disconnect' : 'Connect'}
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(device.id)}
                      title="Delete Device"
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
  );
};

export default DevicesList;