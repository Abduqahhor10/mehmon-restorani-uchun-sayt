import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Categories API
export const getCategories = async () => {
  const response = await apiClient.get('/categories/');
  return response.data;
};

export const createCategory = async (data) => {
  const response = await apiClient.post('/categories/', data);
  return response.data;
};

export const updateCategory = async (id, data) => {
  const response = await apiClient.put(`/categories/${id}/`, data);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await apiClient.delete(`/categories/${id}/`);
  return response.data;
};

export const deleteAllCategories = async () => {
  const response = await apiClient.post('/categories/delete-all/');
  return response.data;
};

export const deleteSelectedCategories = async (ids) => {
  const response = await apiClient.post('/categories/delete-selected/', { ids });
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
  return response.data;
};

export const updateProduct = async (id, formData) => {
  const response = await apiClient.patch(`/products/${id}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await apiClient.delete(`/products/${id}/`);
  return response.data;
};

export const deleteAllProducts = async () => {
  const response = await apiClient.post('/products/delete-all/');
  return response.data;
};

export const deleteSelectedProducts = async (ids) => {
  const response = await apiClient.post('/products/delete-selected/', { ids });
  return response.data;
};

export const duplicateProduct = async (id) => {
  const response = await apiClient.post(`/products/${id}/duplicate/`);
  return response.data;
};


