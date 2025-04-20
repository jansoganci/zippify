import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface Listing {
  id: number;
  title: string;
  description: string;
  tags: string[];
  alt_texts: string[];
  original_prompt: string;
  platform: string;
  created_at: string;
}

export interface PaginatedListings {
  listings: Listing[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const getListings = async (page = 1, limit = 10): Promise<PaginatedListings> => {
  const token = localStorage.getItem('zippify_token');
  const response = await axios.get(`${API_BASE_URL}/listings?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  });
  return response.data.data;
};

export const getListing = async (id: number): Promise<Listing> => {
  const token = localStorage.getItem('zippify_token');
  const response = await axios.get(`${API_BASE_URL}/listings/${id}`, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  });
  return response.data.data;
};
