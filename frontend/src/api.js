import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  login: (username, password) => {
    return apiClient.post('auth/', { username, password });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export const routersAPI = {
  getAll: () => apiClient.get('routers/'),
  getById: (id) => apiClient.get(`routers/${id}/`),
  create: (routerData) => apiClient.post('routers/', routerData),
  update: (id, routerData) => apiClient.put(`routers/${id}/`, routerData),
  delete: (id) => apiClient.delete(`routers/${id}/`),
  getDashboard: (id) => apiClient.get(`routers/${id}/dashboard/`),
};

export const devicesAPI = {
  getAll: (routerId = null) => {
    const url = routerId ? `devices/?router=${routerId}` : 'devices/';
    return apiClient.get(url);
  },
  getById: (id) => apiClient.get(`devices/${id}/`),
  create: (deviceData) => apiClient.post('devices/', deviceData),
  update: (id, deviceData) => apiClient.put(`devices/${id}/`, deviceData),
  delete: (id) => apiClient.delete(`devices/${id}/`),
  toggleStatus: (id) => apiClient.post(`devices/${id}/toggle_status/`),
};

export const routerUsersAPI = {
  getAll: (routerId = null) => {
    const url = routerId ? `router-users/?router=${routerId}` : 'router-users/';
    return apiClient.get(url);
  },
  getById: (id) => apiClient.get(`router-users/${id}/`),
  create: (userData) => apiClient.post('router-users/', userData),
  update: (id, userData) => apiClient.put(`router-users/${id}/`, userData),
  delete: (id) => apiClient.delete(`router-users/${id}/`),
};

export const networkConfigAPI = {
  getAll: () => apiClient.get('network-configs/'),
  getById: (id) => apiClient.get(`network-configs/${id}/`),
  getByRouter: (routerId) => apiClient.get(`network-configs/?router=${routerId}`),
  create: (configData) => apiClient.post('network-configs/', configData),
  update: (id, configData) => apiClient.put(`network-configs/${id}/`, configData),
  toggleWifi: (id) => apiClient.post(`network-configs/${id}/toggle_wifi/`),
  toggleDhcp: (id) => apiClient.post(`network-configs/${id}/toggle_dhcp/`),
};

export const logsAPI = {
  getAll: (routerId = null) => {
    const url = routerId ? `logs/?router=${routerId}` : 'logs/';
    return apiClient.get(url);
  },
  getById: (id) => apiClient.get(`logs/${id}/`),
};

export default {
  auth: authAPI,
  routers: routersAPI,
  devices: devicesAPI,
  routerUsers: routerUsersAPI,
  networkConfig: networkConfigAPI,
  logs: logsAPI,
};