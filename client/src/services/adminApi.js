import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/admin',
  headers: { 'Content-Type': 'application/json' }
});

let adminToken = null;

export const setAdminToken = (token) => {
  adminToken = token;
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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
