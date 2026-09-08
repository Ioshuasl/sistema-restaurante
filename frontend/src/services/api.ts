import axios from 'axios';

const DEFAULT_BACKEND_API_URL = 'https://api-gs-sabores.ioshuavps.com.br/api';
const backendApiUrl = String(import.meta.env.VITE_BACKEND_API_URL || DEFAULT_BACKEND_API_URL)
  .trim()
  .replace(/\/+$/, '');

const api = axios.create({
  baseURL: backendApiUrl,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const onLoginPage = window.location.pathname === '/login';

    if ((status === 401 || status === 403) && !onLoginPage) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.assign('/login');
    }
    return Promise.reject(error);
  }
);

export default api;
