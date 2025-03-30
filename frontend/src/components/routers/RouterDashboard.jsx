import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { routersAPI, devicesAPI, networkConfigAPI, logsAPI } from '../../api';
import DevicesList from '../devices/DevicesList';
import NetworkSettings from '../settings/NetworkSettings';
import RouterLogs from '../logs/RouterLogs';
import RouterUsers from '../users/RouterUsers';
import SecuritySettings from '../security/SecuritySettings';
import './RouterDashboard.css';

const RouterDashboard = () => {
  const { id } = useParams();
  const [router, setRouter] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await routersAPI.getDashboard(id);
      setDashboardData(response.data);
      setRouter(response.data.router);
      setError('');
    } catch (err) {
      setError('Failed to load router dashboard. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Set up polling for real-time updates (every 30 seconds)
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [id]);

  const toggleRouterStatus = async () => {
    try {
      const updatedRouter = { ...router, is_active: !router.is_active };
      await routersAPI.update(id, updatedRouter);
      setRouter(updatedRouter);
    } catch (err) {
      setError('Failed to update router status. Please try again.');
      console.error(err);
    }
  };

  if (loading && !dashboardData) {
    return <div className="loading">Loading router dashboard...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!router) {
    return <div className="not-found">Router not found</div>;
  }

  return (
    <div className="router-dashboard">
      <div className="dashboard-header">
        <div className="router-info">
          <h1>{router.name}</h1>
          <div className="router-status">
            <span className={`status-indicator ${router.is_active ? 'active' : 'inactive'}`}></span>
            <span>{router.is_active ? 'Online' : 'Offline'}</span>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className={`toggle-status-btn ${router.is_active ? 'active' : 'inactive'}`}
            onClick={toggleRouterStatus}
          >
            {router.is_active ? 'Turn Off' : 'Turn On'}
          </button>
          <Link to="/routers" className="back-btn">Back to Routers</Link>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'devices' ? 'active' : ''}`}
          onClick={() => setActiveTab('devices')}
        >
          Connected Devices
        </button>
        <button 
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Network Settings
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
        <button 
          className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          Logs
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="overview-cards">
              <div className="overview-card">
                <h3>Network Information</h3>
                <div className="card-content">
                  <p><strong>IP Address:</strong> {router.ip_address}</p>
                  <p><strong>Subnet Mask:</strong> {router.subnet_mask}</p>
                  <p><strong>Admin Password:</strong> ••••••••</p>
                  <p><strong>Created:</strong> {new Date(router.created_at).toLocaleString()}</p>
                  <p><strong>Last Updated:</strong> {new Date(router.updated_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="overview-card">
                <h3>Connected Devices</h3>
                <div className="card-content">
                  <div className="device-stats">
                    <div className="stat">
                      <span className="stat-value">{dashboardData?.devices?.total || 0}</span>
                      <span className="stat-label">Total Devices</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{dashboardData?.devices?.online || 0}</span>
                      <span className="stat-label">Online</span>
                    </div>
                  </div>
                  <Link to="#" onClick={() => setActiveTab('devices')} className="view-all-link">
                    View All Devices
                  </Link>
                </div>
              </div>

              <div className="overview-card">
                <h3>Network Status</h3>
                <div className="card-content">
                  <div className="network-status">
                    <div className="status-item">
                      <span className="status-label">WiFi:</span>
                      <span className={`status-value ${dashboardData?.network_config?.wifi_enabled ? 'enabled' : 'disabled'}`}>
                        {dashboardData?.network_config?.wifi_enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="status-item">
                      <span className="status-label">DHCP:</span>
                      <span className={`status-value ${dashboardData?.network_config?.dhcp_enabled ? 'enabled' : 'disabled'}`}>
                        {dashboardData?.network_config?.dhcp_enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="status-item">
                      <span className="status-label">SSID:</span>
                      <span className="status-value">
                        {dashboardData?.network_config?.wifi_ssid || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <Link to="#" onClick={() => setActiveTab('settings')} className="view-all-link">
                    Manage Network Settings
                  </Link>
                </div>
              </div>
            </div>

            <div className="recent-logs">
              <h3>Recent Activity</h3>
              {dashboardData?.recent_logs?.length > 0 ? (
                <div className="logs-list">
                  {dashboardData.recent_logs.map(log => (
                    <div key={log.id} className={`log-item ${log.log_type}`}>
                      <span className="log-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className="log-message">{log.message}</span>
                    </div>
                  ))}
                  <Link to="#" onClick={() => setActiveTab('logs')} className="view-all-link">
                    View All Logs
                  </Link>
                </div>
              ) : (
                <p className="no-logs">No recent activity</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'devices' && (
          <DevicesList routerId={id} />
        )}

        {activeTab === 'settings' && (
          <NetworkSettings routerId={id} />
        )}

        {activeTab === 'users' && (
          <RouterUsers routerId={id} />
        )}

        {activeTab === 'security' && (
          <SecuritySettings routerId={id} />
        )}

        {activeTab === 'logs' && (
          <RouterLogs routerId={id} />
        )}
      </div>
    </div>
  );
};

export default RouterDashboard;