import axios from 'axios';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:8000/api';
    }
    // If opened on local network IP (e.g. 192.168.x.x) or local dev host
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host) || host.endsWith('.local')) {
      return `http://${host}:8000/api`;
    }
  }
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Cache-busting interceptor: prevents browser 304/memory cache on GET queries
apiClient.interceptors.request.use((config) => {
  if (config.method?.toLowerCase() === 'get') {
    config.params = {
      _t: Date.now(),
      ...config.params,
    };
    config.headers = {
      ...config.headers,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
    };
  }
  return config;
});

export const getCategories = async () => {
  try {
    const response = await apiClient.get('/categories/?is_active=true');
    return response.data;
  } catch (error) {
    console.warn('Backend API connection warning (Categories):', error.message);
    return [];
  }
};

export const getProducts = async (params = {}) => {
  try {
    const response = await apiClient.get('/products/', { params: { is_active: true, ...params } });
    return response.data;
  } catch (error) {
    console.warn('Backend API connection warning (Products):', error.message);
    return [];
  }
};
