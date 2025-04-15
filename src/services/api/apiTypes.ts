// API response types for Zippify

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

export interface RawListing {
  id: string;
  title: string;
  description: string;
  tags: string[];
  alt_texts: string[];
  original_prompt: string;
  created_at: string;
}

export interface ListingsResponse {
  data: {
    listings: RawListing[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface ListingResponse {
  data: {
    listing: RawListing;
  };
}

// Add more types as needed
