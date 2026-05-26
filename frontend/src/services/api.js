import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('codenova_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const aiAPI = {
  generate: (data) => api.post('/ai/generate', data),
  fix: (data) => api.post('/ai/fix', data),
  explain: (data) => api.post('/ai/explain', data),
};

export const codeAPI = {
  run: (data) => api.post('/code/run', data),
  getLanguages: () => api.get('/code/languages'),
};

export const dashboardAPI = {
  getHistory: () => api.get('/dashboard/history'),
  getSnippets: () => api.get('/dashboard/snippets'),
  createSnippet: (data) => api.post('/dashboard/snippets', data),
  deleteSnippet: (id) => api.delete(`/dashboard/snippets/${id}`),
  getStats: () => api.get('/dashboard/stats'),
};

export default api;
