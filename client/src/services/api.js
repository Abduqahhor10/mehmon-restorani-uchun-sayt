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
  }
  console.error(
    "⚠️ [Mehmon API Warning]: VITE_API_URL sozlanmagan! Serverga deploy qilinganda Vercel/Netlify Environment Variables'ga VITE_API_URL=<backend-url>/api qo'shing."
  );
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
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

