import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { routersAPI, authAPI } from '../../api';
import './RoutersList.css';

const RoutersList = () => {
  const navigate = useNavigate();
  const [routers, setRouters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    ip_address: '192.168.1.1',
    subnet_mask: '255.255.255.0',
    admin_password: 'admin'
  });

  const fetchRouters = async () => {
    try {
      setLoading(true);
      const response = await routersAPI.getAll();
      setRouters(response.data);
      setError('');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        // Unauthorized - token might be invalid or expired
        authAPI.logout();
        navigate('/login');
      } else {
        setError('Failed to load routers. Please try again.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
  };

  useEffect(() => {
    fetchRouters();
  }, []);

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
      await routersAPI.create(formData);
      setFormData({
        name: '',
        ip_address: '192.168.1.1',
        subnet_mask: '255.255.255.0',
        admin_password: 'admin'
      });
      setShowCreateForm(false);
      fetchRouters();
    } catch (err) {
      setError('Failed to create router. Please try again.');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this router?')) {
      try {
        await routersAPI.delete(id);
        fetchRouters();
      } catch (err) {
        setError('Failed to delete router. Please try again.');
        console.error(err);
      }
    }
  };

  if (loading) return <div className="loading">Loading routers...</div>;

  return (
    <div className="routers-list-container">
      <div className="routers-header">
        <div className="header-left">
          <h1>My Virtual Routers</h1>
        </div>
        <div className="header-right">
          <button 
            className="create-router-btn"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : 'Create New Router'}
          </button>
          <button 
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showCreateForm && (
        <div className="create-router-form">
          <h2>Create New Virtual Router</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Router Name</label>
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
            <div className="form-group">
              <label htmlFor="subnet_mask">Subnet Mask</label>
              <input
                type="text"
                id="subnet_mask"
                name="subnet_mask"
                value={formData.subnet_mask}
                onChange={handleChange}
                required
                pattern="^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$"
                title="Please enter a valid subnet mask"
              />
            </div>
            <div className="form-group">
              <label htmlFor="admin_password">Admin Password</label>
              <input
                type="password"
                id="admin_password"
                name="admin_password"
                value={formData.admin_password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="submit-btn">Create Router</button>
          </form>
        </div>
      )}

      {routers.length === 0 ? (
        <div className="no-routers">
          <p>You don't have any virtual routers yet.</p>
          <p>Click "Create New Router" to get started.</p>
        </div>
      ) : (
        <div className="routers-grid">
          {routers.map(router => (
            <div key={router.id} className="router-card">
              <div className="router-status">
                <span className={`status-indicator ${router.is_active ? 'active' : 'inactive'}`}></span>
                <span>{router.is_active ? 'Online' : 'Offline'}</span>
              </div>
              <h2>{router.name}</h2>
              <div className="router-details">
                <p><strong>IP Address:</strong> {router.ip_address}</p>
                <p><strong>Subnet Mask:</strong> {router.subnet_mask}</p>
                <p><strong>Created:</strong> {new Date(router.created_at).toLocaleDateString()}</p>
              </div>
              <div className="router-actions">
                <Link to={`/routers/${router.id}`} className="view-btn">View Dashboard</Link>
                <button 
                  className="delete-btn" 
                  onClick={() => handleDelete(router.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoutersList;