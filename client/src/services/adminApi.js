import axios from 'axios';

const normalizeAdminBase = (rawBase) => {
  const base = (rawBase || 'http://localhost:5000').replace(/\/+$/, '');
  return base.endsWith('/api') ? `${base}/admin` : `${base}/api/admin`;
};

const apiClient = axios.create({
  baseURL: normalizeAdminBase(import.meta.env.VITE_API_URL),
  headers: { 'Content-Type': 'application/json' }
});

let adminToken = localStorage.getItem('adminToken');
if (adminToken) {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
}

export const setAdminToken = (token) => {
  adminToken = token;
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export const login = async (email, password) => {
  const response = await apiClient.post('/login', { email, password });
  setAdminToken(response.data.token);
  return response.data;
};

export const me = async () => {
  if (!adminToken) throw new Error('No admin token set');
  const response = await apiClient.get('/me');
  return response.data;
};

// Add other admin endpoints here, for example:
// export const getUsers = () => apiClient.get('/users');
// export const createEvent = (data) => apiClient.post('/events', data);

export default {
  login,
  me,
  setAdminToken,
};
