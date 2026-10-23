import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5050/api',
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gavel_vpe_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('gavel_vpe_token');
        localStorage.removeItem('gavel_vpe_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
