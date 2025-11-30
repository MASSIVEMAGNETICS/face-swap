/**
 * API Service
 * Handles all HTTP requests to the backend
 */

import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    const message = error.response?.data?.error?.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

/**
 * Authentication API
 */
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  changePassword: (data) => api.put('/auth/password', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
};

/**
 * Projects API
 */
export const projectsAPI = {
  create: (data) => api.post('/projects', data),
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  getResults: (id) => api.get(`/projects/${id}/results`),
  deleteResult: (projectId, resultId) => api.delete(`/projects/${projectId}/results/${resultId}`),
  getStats: () => api.get('/projects/stats'),
};

/**
 * Upload API
 */
export const uploadAPI = {
  uploadSource: (projectId, file, onProgress) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('projectId', projectId);
    
    return api.post('/upload/source', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    });
  },
  
  uploadTarget: (projectId, file, onProgress) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('projectId', projectId);
    
    return api.post('/upload/target', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    });
  },
  
  uploadPair: (projectId, sourceFile, targetFile, onProgress) => {
    const formData = new FormData();
    formData.append('sourceImage', sourceFile);
    formData.append('targetImage', targetFile);
    formData.append('projectId', projectId);
    
    return api.post('/upload/pair', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    });
  },
  
  removeAsset: (projectId, assetId) => api.delete(`/upload/${projectId}/asset/${assetId}`),
  
  detectFaces: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    return api.post('/upload/detect-faces', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

/**
 * Swap API
 */
export const swapAPI = {
  execute: (projectId, options = {}) => api.post(`/swap/${projectId}`, { options }),
  getResult: (resultId) => `${API_BASE_URL}/swap/result/${resultId}`,
  getThumbnail: (resultId) => `${API_BASE_URL}/swap/result/${resultId}/thumbnail`,
  download: (resultId, format = 'png') => `${API_BASE_URL}/swap/download/${resultId}?format=${format}`,
  applyFilter: (resultId, filterType) => api.post(`/swap/result/${resultId}/filter`, { filterType }),
  preview: (data) => api.post('/swap/preview', data),
};

/**
 * Health Check API
 */
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
