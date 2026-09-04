import axios from 'axios';

const PROD_BACKEND_API = 'https://mehmon-restorani-uchun-sayt.onrender.com/api';

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
  return PROD_BACKEND_API;
};

const API_BASE_URL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
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
      'Cache-Control': 'no-cache',
    };
  }
  return config;
});

/**
 * The menu fetchers reject on failure instead of returning [].
 *
 * Swallowing the error and returning an empty array made a single dropped request
 * look exactly like "the restaurant has no dishes", so a brief network hiccup wiped
 * the whole menu off the screen. The caller now keeps the last good data instead.
 */
export const getCategories = async () => {
  const response = await apiClient.get('/categories/', { params: { is_active: true } });
  return Array.isArray(response.data) ? response.data : [];
};

export const getProducts = async (params = {}) => {
  const response = await apiClient.get('/products/', {
    params: { is_active: true, ...params },
  });
  return Array.isArray(response.data) ? response.data : [];
};
