import axios from 'axios';

// API URL yapılandırması
let API_BASE_URL = import.meta.env.VITE_API_URL;

// Geliştirme ortamında çift '/api' sorununu çöz
if (import.meta.env.DEV && API_BASE_URL.endsWith('/api')) {
  // Geliştirme ortamında, API_BASE_URL'den '/api' kısmını kaldır
  API_BASE_URL = API_BASE_URL.slice(0, -4); // '/api' kısmını kaldır
  console.log(`[API] Geliştirme ortamında API_BASE_URL düzeltildi: ${API_BASE_URL}`);
}

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
  devLog(`${config.method?.toUpperCase()} ${config.url}`);
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
    const response = await apiClient.post('/api/auth/login', { email, password });
    return handleAuthResponse(response);
  },

  async register(username, email, password) {
    const response = await apiClient.post('/api/auth/register', { username, email, password });
    return handleAuthResponse(response);
  },

  async forgotPassword(email) {
    const response = await apiClient.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(newPassword, token) {
    const response = await apiClient.post('/api/auth/reset-password', { 
      newPassword,
      token
    });
    return response.data;
  },

  async verifyEmail(token) {
    const response = await apiClient.post('/api/auth/verify-email', { token });
    return response.data;
  },
  // Profile endpoints
  async getProfile() {
    const response = await apiClient.get('/api/profile');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await apiClient.put('/api/profile', profileData);
    return response.data;
  },

  // Listings endpoints
  async getListings(userId) {
    const response = await apiClient.get(`/api/listings?userId=${userId}`);
    return response.data;
  },
  
  async getListing(listingId) {
    const response = await apiClient.get(`/api/listings/${listingId}`);
    return response.data;
  },

  async createListing(listingData) {
    const response = await apiClient.post('/api/listings', listingData);
    return response.data;
  },

  async updateListing(listingId, listingData) {
    const response = await apiClient.put(`/api/listings/${listingId}`, listingData);
    return response.data;
  },

  async deleteListing(listingId) {
    await apiClient.delete(`/api/listings/${listingId}`);
  },

  // Files endpoints
  async getFiles(listingId) {
    const response = await apiClient.get(`/api/files?listingId=${listingId}`);
    return response.data;
  },

  async uploadFile(listingId, fileData) {
    const formData = new FormData();
    formData.append('file', fileData);
    formData.append('listingId', listingId);
    
    const response = await apiClient.post('/api/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
