import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('zippify_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication related functions
const handleAuthResponse = (response: AxiosResponse): any => {
  if (response.data.token) {
    localStorage.setItem('zippify_token', response.data.token);
  }
  return response.data;
};

// Types
interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

interface ProfileData {
  username?: string;
  bio?: string;
  website?: string;
  avatar?: string;
}

interface ListingData {
  title: string;
  description: string;
  price?: number;
  images?: string[];
  tags?: string[];
  category?: string;
}

export const api = {
  // Authentication endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', { email, password });
    return handleAuthResponse(response);
  },

  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', { username, email, password });
    return handleAuthResponse(response);
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(newPassword: string, token: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/reset-password', { 
      newPassword,
      token
    });
    return response.data;
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/verify-email', { token });
    return response.data;
  },
  
  // Profile endpoints
  async getProfile(userId: string): Promise<any> {
    const response = await apiClient.get(`/profiles/${userId}`);
    return response.data;
  },

  async updateProfile(userId: string, profileData: ProfileData): Promise<any> {
    const response = await apiClient.put(`/profiles/${userId}`, profileData);
    return response.data;
  },

  // Listings endpoints
  async getListings(userId: string): Promise<any[]> {
    const response = await apiClient.get(`/listings?userId=${userId}`);
    return response.data;
  },

  async createListing(listingData: ListingData): Promise<any> {
    const response = await apiClient.post('/listings', listingData);
    return response.data;
  },

  async updateListing(listingId: string, listingData: Partial<ListingData>): Promise<any> {
    const response = await apiClient.put(`/listings/${listingId}`, listingData);
    return response.data;
  },

  async deleteListing(listingId: string): Promise<void> {
    await apiClient.delete(`/listings/${listingId}`);
  },

  // Files endpoints
  async getFiles(listingId: string): Promise<any[]> {
    const response = await apiClient.get(`/files?listingId=${listingId}`);
    return response.data;
  },

  async uploadFile(listingId: string, fileData: File): Promise<any> {
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
