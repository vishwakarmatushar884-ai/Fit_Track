import axios from 'axios';

// Determine default base URL: use environment variable if present, or fallback to live Render backend API
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // In browser production mode on Vercel or custom domain
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://fit-track-4.onrender.com/api';
  }
  return '/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('fittrack_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;
