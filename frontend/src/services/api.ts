
import axios from 'axios';

const DEFAULT_BACKEND_API_URL = 'https://api-gs-sabores.ioshuavps.com.br/api';
const backendApiUrl = import.meta.env.VITE_BACKEND_API_URL || DEFAULT_BACKEND_API_URL;

const api = axios.create({
  baseURL: backendApiUrl,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
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
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      window.location.pathname !== '/login'
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
