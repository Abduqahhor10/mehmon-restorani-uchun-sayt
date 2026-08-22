import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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

