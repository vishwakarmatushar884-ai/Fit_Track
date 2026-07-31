import axios from 'axios';

// Ensure base URL always correctly includes /api/
const getBaseURL = () => {
  let url = import.meta.env.VITE_API_URL || 'https://fit-track-4.onrender.com/api';
  
  // Clean up trailing slashes
  url = url.replace(/\/+$/, '');
  
  if (!url.endsWith('/api')) {
    url = url + '/api';
  }
  
  return url + '/';
};

const API = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: fix leading slashes and attach JWT token
API.interceptors.request.use((config) => {
  // If config.url starts with '/', remove it so Axios appends it relative to /api/
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
