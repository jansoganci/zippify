import axios from 'axios';

// ✅ STANDARD ENDPOINT CONFIGURATION
// Development: http://localhost:8080/api/* -> proxy -> http://localhost:3001/api/*
// Production: https://yourdomain.com/api/*

const API_BASE_URL = import.meta.env.DEV 
  ? '/api'  // Use proxy in development
  : import.meta.env.VITE_API_URL || '/api';  // Use env variable in production

// DEBUG: Log environment information
console.log('🔍 API CLIENT DEBUG:', {
  isDEV: import.meta.env.DEV,
  MODE: import.meta.env.MODE,
  VITE_API_URL: import.meta.env.VITE_API_URL,
  API_BASE_URL: API_BASE_URL,
  currentURL: window.location.href
});

// Development-only logging function - only logs essential information
const devLog = (message, ...args) => {
  if (import.meta.env.DEV) {
    // Only log important API events, not detailed data
    if (import.meta.env.MODE !== 'production') console.log(`[API] ${message}`);
  }
};

// Development-only error logging function
const devError = (message, ...args) => {
  if (import.meta.env.DEV) {
    console.error(`[API] ${message}`, ...args);
  }
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
// Add request logging interceptor
apiClient.interceptors.request.use((config) => {
  devLog(`${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  const token = localStorage.getItem('zippify_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Removed verbose config logging
  return config;
});

// Authentication related functions
const handleAuthResponse = (response) => {
  if (response.data.token) {
    localStorage.setItem('zippify_token', response.data.token);
  }
  return response.data;
};

export const api = {
  // Authentication endpoints
  async login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password });
    return handleAuthResponse(response);
  },

  async register(username, email, password) {
    const response = await apiClient.post('/auth/register', { username, email, password });
    return handleAuthResponse(response);
  },

  async forgotPassword(email) {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(newPassword, token) {
    const response = await apiClient.post('/auth/reset-password', { 
      newPassword,
      token
    });
    return response.data;
  },

  async verifyEmail(token) {
    const response = await apiClient.post('/auth/verify-email', { token });
    return response.data;
  },
  // Profile endpoints
  async getProfile() {
    const response = await apiClient.get('/profile');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await apiClient.put('/profile', profileData);
    return response.data;
  },

  // Listings endpoints
  async getListings(userId) {
    const response = await apiClient.get(`/listings?userId=${userId}`);
    return response.data;
  },
  
  async getListing(listingId) {
    const response = await apiClient.get(`/listings/${listingId}`);
    return response.data;
  },

  async createListing(listingData) {
    const response = await apiClient.post('/listings', listingData);
    return response.data;
  },

  async updateListing(listingId, listingData) {
    const response = await apiClient.put(`/listings/${listingId}`, listingData);
    return response.data;
  },

  async deleteListing(listingId) {
    await apiClient.delete(`/listings/${listingId}`);
  },

  // Files endpoints
  async getFiles(listingId) {
    const response = await apiClient.get(`/files?listingId=${listingId}`);
    return response.data;
  },

  async uploadFile(listingId, fileData) {
    const formData = new FormData();
    formData.append('file', fileData);
    formData.append('listingId', listingId);
    
    const response = await apiClient.post('/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
