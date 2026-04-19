import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on auth pages
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register')
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ────────────────────────────────────────────
export const authAPI = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// ─── URL API ─────────────────────────────────────────────
export const urlAPI = {
  create: (data: {
    originalUrl: string;
    customAlias?: string;
    title?: string;
    expiresAt?: string;
  }) => api.post('/urls', data),
  list: (page = 1, limit = 10) =>
    api.get(`/urls?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get(`/urls/${id}`),
  update: (id: string, data: any) => api.patch(`/urls/${id}`, data),
  delete: (id: string) => api.delete(`/urls/${id}`),
};

// ─── Analytics API ───────────────────────────────────────
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getUrlAnalytics: (id: string, days = 30) =>
    api.get(`/analytics/urls/${id}?days=${days}`),
};

// ─── QR Code API ─────────────────────────────────────────
export const qrAPI = {
  get: (id: string, format = 'png', width = 300) =>
    api.get(`/qr/${id}?format=${format}&width=${width}`),
  downloadUrl: (id: string, width = 300) =>
    `${API_BASE}/qr/${id}/download?width=${width}`,
};

// ─── Admin API ───────────────────────────────────────────
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  listUsers: (page = 1, limit = 10, search = '') =>
    api.get(`/admin/users?page=${page}&limit=${limit}&search=${search}`),
  getUserDetails: (id: string) => api.get(`/admin/users/${id}`),
  toggleUser: (id: string) => api.patch(`/admin/users/${id}/toggle`),
  changeRole: (id: string, role: string) =>
    api.patch(`/admin/users/${id}/role`, { role }),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  listUrls: (page = 1, limit = 10, search = '', active?: string) =>
    api.get(
      `/admin/urls?page=${page}&limit=${limit}&search=${search}${active ? `&active=${active}` : ''}`
    ),
  toggleUrl: (id: string) => api.patch(`/admin/urls/${id}/toggle`),
  deleteUrl: (id: string) => api.delete(`/admin/urls/${id}`),
};

export default api;