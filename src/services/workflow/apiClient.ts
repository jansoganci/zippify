/**
 * Frontend-compatible API client for DeepSeek services
 * This is a browser-safe version that doesn't import Node.js modules
 */

import axios from 'axios';

// Constants for API configuration
export const API_URL = import.meta.env.VITE_DEEPSEEK_API_URL || '';
export const MODEL = import.meta.env.VITE_DEEPSEEK_MODEL || 'deepseek-chat';
export const MAX_TOKENS = parseInt(import.meta.env.VITE_DEEPSEEK_MAX_TOKENS || '4096', 10);

// Create axios instance for DeepSeek API
export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Error handling interceptor
apiClient.interceptors.response.use(
  response => response,
  err => {
    if (import.meta.env.MODE !== 'production') {
      console.error('API Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
    }
    return Promise.reject(err);
  }
);

// Create axios instance for backend API calls
export const backendApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token if available
backendApi.interceptors.request.use(config => {
  const token = localStorage.getItem('zippify_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

/**
 * Make a request to the DeepSeek API
 * This is a stub function that will be replaced by actual backend calls
 * Frontend code should not directly call DeepSeek API
 */
export const makeRequest = async (endpoint: string, data: any) => {
  console.warn('Frontend code attempted to call DeepSeek API directly. This is not supported.');
  throw new Error('Direct DeepSeek API calls are not supported in the frontend. Use backend endpoints instead.');
};
