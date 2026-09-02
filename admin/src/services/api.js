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

// Broadcast live changes to other tabs / client website immediately
export const broadcastChange = () => {
  try {
    if (typeof window !== 'undefined') {
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel('mehmon_sync_channel');
        bc.postMessage({ type: 'DATA_CHANGED', time: Date.now() });
        bc.close();
      }
      localStorage.setItem('mehmon_menu_update', Date.now().toString());
    }
  } catch (e) {
    // Ignore cross-origin storage restrictions if any
  }
};

// Categories API
export const getCategories = async () => {
  const response = await apiClient.get('/categories/');
  return response.data;
};

export const createCategory = async (data) => {
  const response = await apiClient.post('/categories/', data);
  broadcastChange();
  return response.data;
};

export const updateCategory = async (id, data) => {
  const response = await apiClient.put(`/categories/${id}/`, data);
  broadcastChange();
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await apiClient.delete(`/categories/${id}/`);
  broadcastChange();
  return response.data;
};

export const deleteAllCategories = async () => {
  const response = await apiClient.post('/categories/delete-all/');
  broadcastChange();
  return response.data;
};

export const deleteSelectedCategories = async (ids) => {
  const response = await apiClient.post('/categories/delete-selected/', { ids });
  broadcastChange();
  return response.data;
};

// Products API
export const getProducts = async (params = {}) => {
  const response = await apiClient.get('/products/', { params });
  return response.data;
};

export const createProduct = async (formData) => {
  const response = await apiClient.post('/products/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  broadcastChange();
  return response.data;
};

export const updateProduct = async (id, formData) => {
  const response = await apiClient.patch(`/products/${id}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  broadcastChange();
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await apiClient.delete(`/products/${id}/`);
  broadcastChange();
  return response.data;
};

export const deleteAllProducts = async () => {
  const response = await apiClient.post('/products/delete-all/');
  broadcastChange();
  return response.data;
};

export const deleteSelectedProducts = async (ids) => {
  const response = await apiClient.post('/products/delete-selected/', { ids });
  broadcastChange();
  return response.data;
};

export const duplicateProduct = async (id) => {
  const response = await apiClient.post(`/products/${id}/duplicate/`);
  broadcastChange();
  return response.data;
};
