import axios from 'axios';

const normalizeApiBase = (rawBase) => {
  const base = (rawBase || 'http://localhost:5000').replace(/\/+$/, '');
  return base.endsWith('/api') ? base : `${base}/api`;
};

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

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

// Global 401: clear auth and redirect to login.
// When backend supports refresh tokens, try refresh here before redirecting.
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

// Username availability
api.checkUsername = async (username) => {
  const res = await api.get('/users/check-username', { params: { username } });
  return res.data?.data ?? { available: false };
};

// Profile photo upload (multipart, file field: avatar)
api.uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  const res = await api.post('/upload/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data?.data?.url;
};

// Chapters (unified Professional Chapters / Societies / Clubs / Celebrations)
api.chaptersStats = async () => {
  const res = await api.get('/chapters/stats');
  return res.data?.data || {};
};

api.listChapters = async (filters = {}) => {
  const params = { page: filters.page || 1, limit: filters.limit || 24 };
  if (filters.category) params.category = filters.category;
  if (filters.search) params.search = filters.search;
  const res = await api.get('/chapters', { params });
  return res.data?.data || { items: [], total: 0, page: 1, pages: 0 };
};

api.getChapter = async (id) => {
  const res = await api.get(`/chapters/${id}`);
  return res.data?.data || {};
};

api.updateChapter = async (id, body) => {
  const res = await api.patch(`/chapters/${id}`, body);
  return res.data?.data?.organization;
};

api.submitJoinRequest = async (chapterId, body) => {
  const res = await api.post(`/chapters/${chapterId}/join`, body);
  return res.data?.data;
};

api.listJoinRequests = async (chapterId, params = {}) => {
  const res = await api.get(`/chapters/${chapterId}/join-requests`, { params });
  return res.data?.data || { requests: [], total: 0, page: 1, pages: 0 };
};

api.reviewJoinRequest = async (chapterId, requestId, status, remarks) => {
  const res = await api.patch(`/chapters/${chapterId}/join-requests/${requestId}`, { status, remarks });
  return res.data?.data;
};

api.addChapterGalleryImage = async (chapterId, url, caption) => {
  const res = await api.post(`/chapters/${chapterId}/gallery`, { url, caption });
  return res.data?.data?.gallery || [];
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
