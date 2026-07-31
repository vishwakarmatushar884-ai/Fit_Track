import axios from 'axios';

// Live Production Render Backend API URL
const PRODUCTION_API = 'https://fit-track-4.onrender.com/api/';

const getBaseURL = () => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return '/api/';
  }
  return PRODUCTION_API;
};

const API = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to normalize URL paths and attach JWT token
API.interceptors.request.use((config) => {
  // Strip leading slash if present to guarantee proper concatenation with /api/
  if (config.url && config.url.startsWith('/')) {
    config.url = config.url.substring(1);
  }

  const token = localStorage.getItem('fittrack_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;
