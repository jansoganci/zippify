import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('zippify_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Profile endpoints
  async getProfile(userId) {
    const response = await apiClient.get(`/profiles/${userId}`);
    return response.data;
  },

  async updateProfile(userId, profileData) {
    const response = await apiClient.put(`/profiles/${userId}`, profileData);
    return response.data;
  },

  // Listings endpoints
  async getListings(userId) {
    const response = await apiClient.get(`/listings?userId=${userId}`);
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
