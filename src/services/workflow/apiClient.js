import axios from 'axios';

// Axios instance for frontend API calls (via Nginx proxy)
const backendApi = axios.create({
  baseURL: '/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token if available (from localStorage)
backendApi.interceptors.request.use(config => {
  const token = localStorage.getItem('zippify_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

export { backendApi };