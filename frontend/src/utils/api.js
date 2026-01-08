import axios from 'axios';
import { getCached, setCached } from './cache';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors and cache responses
api.interceptors.response.use(
  (response) => {
    const config = response.config;
    
    // Cache successful GET responses (unless cache is disabled)
    if (config.method === 'get' && config.cache !== false && response.status === 200) {
      const url = config.url || '';
      const params = config.params || {};
      setCached(url, response.data, params);
    }
    
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // If request fails, try to return cached data as fallback
    if (error.config && error.config.method === 'get' && error.config.cache !== false) {
      const url = error.config.url || '';
      const params = error.config.params || {};
      const cached = getCached(url, params);
      
      if (cached !== null) {
        console.warn('API request failed, using cached data:', url);
        return Promise.resolve({
          data: cached,
          status: 200,
          statusText: 'OK (cached)',
          headers: {},
          config: error.config,
        });
      }
    }
    
    return Promise.reject(error);
  }
);

// Wrapper for GET requests with caching
const originalGet = api.get.bind(api);
api.get = async (url, config = {}) => {
  // Check cache first (unless disabled)
  if (config.cache !== false) {
    const params = config.params || {};
    const cached = getCached(url, params);
    
    if (cached !== null) {
      // Return cached response immediately
      return Promise.resolve({
        data: cached,
        status: 200,
        statusText: 'OK (cached)',
        headers: {},
        config: { ...config, url },
      });
    }
  }
  
  // Make actual request
  return originalGet(url, config);
};

export default api;

