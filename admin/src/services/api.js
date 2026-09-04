import axios from 'axios';

const PROD_BACKEND_API = 'https://mehmon-restorani-uchun-sayt.onrender.com/api';
const TOKEN_STORAGE_KEY = 'mehmon_admin_token';

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
  timeout: 30000,
});

/* ------------------------------ Auth token ------------------------------ */

export const getStoredToken = () => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || null;
  } catch {
    return null;
  }
};

export const setStoredToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Private browsing / storage disabled: the in-memory session still works.
  }
};

// Called by AuthContext when the server rejects our token, so the UI can log out
// instead of silently failing every request.
let onUnauthorized = null;
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers = { ...config.headers, Authorization: `Token ${token}` };
  }

  // Cache-busting: prevents browser 304/memory cache on GET queries
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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if ((status === 401 || status === 403) && getStoredToken() && onUnauthorized) {
      onUnauthorized(status);
    }
    return Promise.reject(error);
  }
);

/**
 * Turns an axios/DRF error into a single readable Uzbek sentence.
 * DRF returns per-field arrays, a `detail` string, or plain text depending on the
 * failure, and the old code surfaced only `err.message` ("Request failed with
 * status code 400"), which told the user nothing.
 */
export const describeApiError = (error, fallback = "Noma'lum xatolik yuz berdi") => {
  if (!error) return fallback;

  if (error.code === 'ECONNABORTED') {
    return "Server javob bermadi (vaqt tugadi). Internet aloqasini tekshiring.";
  }
  if (!error.response) {
    return "Serverga ulanib bo'lmadi. Internet aloqasini yoki backend manzilini tekshiring.";
  }

  const { status, data } = error.response;

  if (status === 401) return "Sessiya tugagan. Iltimos, qaytadan tizimga kiring.";
  if (status === 403) return "Bu amalni bajarish uchun huquqingiz yo'q.";
  if (status === 404) return "Ma'lumot topilmadi (allaqachon o'chirilgan bo'lishi mumkin).";
  if (status === 413) return "Yuborilgan fayl juda katta.";
  if (status >= 500) return `Serverda xatolik (${status}). Birozdan so'ng qayta urinib ko'ring.`;

  if (typeof data === 'string' && data.trim()) {
    return data.length > 300 ? `${data.slice(0, 300)}…` : data;
  }
  if (data?.detail) return String(data.detail);
  if (data && typeof data === 'object') {
    const parts = Object.entries(data).map(([field, value]) => {
      const text = Array.isArray(value) ? value.join(', ') : String(value);
      return field === 'non_field_errors' ? text : `${field}: ${text}`;
    });
    if (parts.length) return parts.join(' | ');
  }
  return error.message || fallback;
};

export const login = async (username, password) => {
  const response = await apiClient.post('/auth/login/', { username, password });
  setStoredToken(response.data.token);
  return response.data.user;
};

export const fetchCurrentUser = async () => {
  const response = await apiClient.get('/auth/me/');
  return response.data;
};

export const logout = async () => {
  try {
    await apiClient.post('/auth/logout/');
  } catch {
    // Token may already be invalid server-side; clearing it locally is enough.
  }
  setStoredToken(null);
};

/* ------------------------------ Live sync ------------------------------ */

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
  } catch {
    // Ignore cross-origin storage restrictions if any
  }
};

/* ------------------------------ Categories ------------------------------ */

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
  const response = await apiClient.patch(`/categories/${id}/`, data);
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

/* ------------------------------ Products ------------------------------ */

export const getProducts = async (params = {}) => {
  const response = await apiClient.get('/products/', { params });
  return response.data;
};

export const createProduct = async (formData) => {
  const response = await apiClient.post('/products/', formData);
  broadcastChange();
  return response.data;
};

export const updateProduct = async (id, formData) => {
  const response = await apiClient.patch(`/products/${id}/`, formData);
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
