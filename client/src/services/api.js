const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
console.log('API_BASE_URL:', API_BASE_URL);

const getAuthToken = () => localStorage.getItem('token');

const defaultHeaders = () => ({
  'Content-Type': 'application/json',
  ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
});

// API request wrapper with timeout
const apiRequest = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please check your connection');
    }
    throw error;
  }
};

const api = {
  login: async (email, password) => {
    const requestBody = { email, password };
    console.log('Login request body:', requestBody);
    console.log('Login URL:', `${API_BASE_URL}/api/auth/login`);
    
    const res = await apiRequest(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: defaultHeaders(),
      body: JSON.stringify(requestBody),
    });
    
    console.log('Response status:', res.status);
    console.log('Response ok:', res.ok);
    
    const json = await res.json();
    console.log('Response data:', json);
    
    if (!res.ok) {
      console.error('Login failed:', json);
      throw new Error(json?.message || 'Login failed');
    }
    return json; // Backend returns { token, user } directly
  },
  register: async (name, email, password, role = 'student') => {
    const res = await apiRequest(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: defaultHeaders(),
      body: JSON.stringify({ name, email, password, role }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || 'Register failed');
    return json; // Backend returns { token, user } directly
  },
  me: async () => {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, { headers: defaultHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || 'Fetch profile failed');
    return json; // Backend returns user object directly
  },
  listEvents: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    const res = await apiRequest(`${API_BASE_URL}/api/events?${q}`, { headers: defaultHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Fetch events failed');
    return json.data.items; // Backend returns { success: true, data: { items: [...] } }
  },
  upcomingEvents: async () => {
    const res = await apiRequest(`${API_BASE_URL}/api/events/upcoming`, { headers: defaultHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Fetch upcoming failed');
    return json.data.items; // Backend returns { success: true, data: { items: [...] } }
  },
  getEvent: async (eventId) => {
    const res = await apiRequest(`${API_BASE_URL}/api/events/${eventId}`, { headers: defaultHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Fetch event failed');
    return json.data.event; // Backend returns { success: true, data: { event: {...} } }
  },
  registerForEvent: async (eventId) => {
    const res = await apiRequest(`${API_BASE_URL}/api/events/${eventId}/register`, {
      method: 'POST',
      headers: defaultHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Register for event failed');
    return json.data.event; // Backend returns { success: true, data: { event: {...} } }
  },
  listClubs: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    const res = await apiRequest(`${API_BASE_URL}/api/clubs?${q}`, { headers: defaultHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Fetch clubs failed');
    return json.data.items; // Backend returns { success: true, data: { items: [...] } }
  },
  getClub: async (clubId) => {
    const res = await apiRequest(`${API_BASE_URL}/api/clubs/${clubId}`, { headers: defaultHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Fetch club failed');
    return json.data.club; // Backend returns { success: true, data: { club: {...} } }
  },
  clubEvents: async (clubId, params = {}) => {
    const q = new URLSearchParams(params).toString();
    const res = await apiRequest(`${API_BASE_URL}/api/clubs/${clubId}/events?${q}`, { headers: defaultHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Fetch club events failed');
    return json.data.items; // Backend returns { success: true, data: { items: [...] } }
  },
  recentNotifications: async (limit = 10) => {
    const res = await apiRequest(`${API_BASE_URL}/api/notifications/recent?limit=${limit}`, { headers: defaultHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Fetch notifications failed');
    return json.data.items; // Backend returns { success: true, data: { items: [...] } }
  },
  
  // Admin API functions
  listUsers: async () => {
    const res = await fetch(`${API_BASE_URL}/api/admin/users`, { headers: defaultHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Fetch users failed');
    return json.data; // Backend returns { success: true, data: [...] }
  },

  // Club Admin API functions
  getClubAdminClub: async () => {
    const res = await fetch(`${API_BASE_URL}/api/club-admin/club`, { headers: defaultHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Fetch club failed');
    return json.data.club; // Backend returns { success: true, data: { club: {...} } }
  },

  getClubAdminEvents: async () => {
    const res = await fetch(`${API_BASE_URL}/api/club-admin/events`, { headers: defaultHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Fetch events failed');
    return json.data.items; // Backend returns { success: true, data: { items: [...] } }
  },

  createClubEvent: async (eventData) => {
    const res = await fetch(`${API_BASE_URL}/api/club-admin/events`, {
      method: 'POST',
      headers: defaultHeaders(),
      body: JSON.stringify(eventData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Create event failed');
    return json.data.event; // Backend returns { success: true, data: { event: {...} } }
  },

  updateClubEvent: async (eventId, eventData) => {
    const res = await fetch(`${API_BASE_URL}/api/club-admin/events/${eventId}`, {
      method: 'PUT',
      headers: defaultHeaders(),
      body: JSON.stringify(eventData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Update event failed');
    return json.data.event; // Backend returns { success: true, data: { event: {...} } }
  },

  deleteClubEvent: async (eventId) => {
    const res = await fetch(`${API_BASE_URL}/api/club-admin/events/${eventId}`, {
      method: 'DELETE',
      headers: defaultHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Delete event failed');
    return json.data; // Backend returns { success: true, data: {...} }
  },

  updateClubDetails: async (clubData) => {
    const res = await fetch(`${API_BASE_URL}/api/club-admin/club`, {
      method: 'PUT',
      headers: defaultHeaders(),
      body: JSON.stringify(clubData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Update club failed');
    return json.data.club; // Backend returns { success: true, data: { club: {...} } }
  },

  recruitUser: async (userData) => {
    const res = await fetch(`${API_BASE_URL}/api/club-admin/recruit`, {
      method: 'POST',
      headers: defaultHeaders(),
      body: JSON.stringify(userData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Recruitment failed');
    return json.data; // Backend returns { success: true, data: {...} }
  },

  uploadEventPoster: async (eventId, formData) => {
    const res = await fetch(`${API_BASE_URL}/api/club-admin/events/${eventId}/poster`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: formData,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Poster upload failed');
    return json.data; // Backend returns { success: true, data: {...} }
  },
  
  createEvent: async (eventData) => {
    const res = await fetch(`${API_BASE_URL}/api/events`, {
      method: 'POST',
      headers: defaultHeaders(),
      body: JSON.stringify(eventData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Create event failed');
    return json.data.event; // Backend returns { success: true, data: { event: {...} } }
  },
  
  updateEvent: async (eventId, eventData) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/events/${eventId}`, {
      method: 'PUT',
      headers: defaultHeaders(),
      body: JSON.stringify(eventData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Update event failed');
    return json.data.event; // Backend returns { success: true, data: { event: {...} } }
  },
  
  deleteEvent: async (eventId) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/events/${eventId}`, {
      method: 'DELETE',
      headers: defaultHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Delete event failed');
    return json.data; // Backend returns { success: true, data: {...} }
  },
};

export default api;
