import { useState, useEffect } from 'react';
import { routerUsersAPI } from '../../api';
import './RouterUsers.css';

const RouterUsers = ({ routerId }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    user_type: 'guest'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await routerUsersAPI.getAll(routerId);
      setUsers(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load router users. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [routerId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      user_type: 'guest'
    });
    setEditingUserId(null);
    setShowCreateForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUserId) {
        const dataToUpdate = { ...formData };
        if (!dataToUpdate.password) {
          delete dataToUpdate.password;
        }
        await routerUsersAPI.update(editingUserId, dataToUpdate);
        setSuccessMessage('User updated successfully!');
      } else {
        await routerUsersAPI.create({
          ...formData,
          router: routerId
        });
        setSuccessMessage('User created successfully!');
      }
      
      resetForm();
      fetchUsers();
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError(editingUserId ? 'Failed to update user. Please try again.' : 'Failed to create user. Please try again.');
      console.error(err);
    }
  };

  const handleEdit = (user) => {
    setFormData({
      username: user.username,
      password: '',
      user_type: user.user_type
    });
    setEditingUserId(user.id);
    setShowCreateForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await routerUsersAPI.delete(id);
        setSuccessMessage('User deleted successfully!');
        fetchUsers();
        
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (err) {
        setError('Failed to delete user. Please try again.');
        console.error(err);
      }
    }
  };

  if (loading && users.length === 0) {
    return <div className="loading">Loading router users...</div>;
  }

  return (
    <div className="router-users-container">
      <div className="users-header">
        <h2>Router User Accounts</h2>
        <button 
          className="create-user-btn"
          onClick={() => {
            resetForm();
            setShowCreateForm(!showCreateForm);
          }}
        >
          {showCreateForm ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {showCreateForm && (
        <div className="user-form">
          <h3>{editingUserId ? 'Edit User' : 'Add New User'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">
                Password {editingUserId ? '(leave blank to keep current)' : ''}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!editingUserId}
              />
            </div>
            <div className="form-group">
              <label htmlFor="user_type">User Type</label>
              <select
                id="user_type"
                name="user_type"
                value={formData.user_type}
                onChange={handleChange}
              >
                <option value="admin">Administrator</option>
                <option value="guest">Guest</option>
                <option value="limited">Limited Access</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="save-btn">
                {editingUserId ? 'Update User' : 'Add User'}
              </button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {users.length === 0 ? (
        <div className="no-users">
          <p>No user accounts configured for this router.</p>
          <p>Click "Add User" to create a new user account.</p>
        </div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>User Type</th>
                <th>Created</th>
                <th>Last Login</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>
                    <span className={`user-type ${user.user_type}`}>
                      {user.user_type === 'admin' ? 'Administrator' : 
                       user.user_type === 'guest' ? 'Guest' : 'Limited Access'}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>{user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</td>
                  <td>
                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="edit-btn"
                      onClick={() => handleEdit(user)}
                      title="Edit User"
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(user.id)}
                      title="Delete User"
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

export default RouterUsers;