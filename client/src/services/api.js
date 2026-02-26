import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── High-level helpers used across the app ───────────────────────────────────

// Events (public)
api.listEvents = async (filters = {}) => {
  const params = {};
  if (filters.search) params.search = filters.search;
  if (filters.clubId) params.clubId = filters.clubId;

  // Map legacy date filters to from/to
  if (filters.date) {
    const now = new Date();
    let from;
    let to;
    if (filters.date === 'today') {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    } else if (filters.date === 'week') {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
    } else if (filters.date === 'month') {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }
    if (from) params.from = from.toISOString();
    if (to) params.to = to.toISOString();
  }

  const res = await api.get('/events', { params });
  return res.data?.data?.events || [];
};

api.upcomingEvents = async () => {
  const now = new Date();
  const res = await api.get('/events', {
    params: { from: now.toISOString(), limit: 20 },
  });
  return res.data?.data?.events || [];
};

api.getEvent = async (id) => {
  const res = await api.get(`/events/${id}`);
  return res.data?.data?.event;
};

api.registerForEvent = async (eventId) => {
  const res = await api.post(`/events/${eventId}/register`);
  return res.data?.data;
};

// Clubs / organizations (public)
api.listClubs = async (filters = {}) => {
  const params = {};
  if (filters.search) params.search = filters.search;

  // Map simple category filters to organization type where possible
  if (filters.category) {
    const map = {
      technical: 'Professional Chapter',
      cultural: 'Club',
      sports: 'Council',
      workshop: 'Campus Event',
    };
    const mapped = map[filters.category];
    if (mapped) params.type = mapped;
  }

  const res = await api.get('/organizations', { params });
  return res.data?.data?.organizations || [];
};

api.getClub = async (id) => {
  const res = await api.get(`/organizations/${id}`);
  return res.data?.data?.organization;
};

api.clubEvents = async (orgId) => {
  const res = await api.get('/events', { params: { clubId: orgId } });
  return res.data?.data?.events || [];
};

// Admin helpers
api.listUsers = async () => {
  const res = await api.get('/admin/users');
  return res.data?.data?.users || [];
};

api.listAdminEvents = async () => {
  const res = await api.get('/admin/events');
  return res.data?.data?.events || [];
};

api.updateAdminEventStatus = async (eventId, status) => {
  if (status === 'approved') {
    await api.post(`/admin/events/${eventId}/approve`);
  } else if (status === 'rejected') {
    await api.post(`/admin/events/${eventId}/reject`, { reason: '' });
  } else {
    // For other statuses fallback to generic event update (if needed later)
    await api.patch(`/events/${eventId}`, { status });
  }
};

// Notifications
api.recentNotifications = async (limit = 10) => {
  const res = await api.get('/notifications', { params: { limit } });
  return res.data?.data?.notifications || [];
};

export default api;
