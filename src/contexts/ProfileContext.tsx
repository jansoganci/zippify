import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { createLogger } from "@/utils/logger";

interface ProfileData {
  firstName: string;
  lastName: string;
  storeName: string;
  email?: string;
  theme?: string;
}

interface ProfileContextType {
  profileData: ProfileData | undefined;
  isLoading: boolean;
  error: Error | null;
  updateProfile: (data: ProfileData) => void;
  isUpdating: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Create logger for this context
const logger = createLogger('ProfileContext');

// API functions
const fetchProfile = async (): Promise<ProfileData> => {
  const token = localStorage.getItem('zippify_token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  let baseUrl = import.meta.env.VITE_API_URL || '';
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  
  const apiPath = baseUrl.includes('/api') ? '/profile' : '/api/profile';
  
  const response = await fetch(`${baseUrl}${apiPath}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.status === 401 || response.status === 403) {
    throw new Error('Unauthorized: Please login again');
  }
  
  if (!response.ok) {
    throw new Error('Failed to fetch profile data');
  }
  
  return response.json();
};

const updateProfileAPI = async (data: ProfileData): Promise<ProfileData> => {
  const token = localStorage.getItem('zippify_token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  let baseUrl = import.meta.env.VITE_API_URL || '';
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  
  const apiPath = baseUrl.includes('/api') ? '/profile' : '/api/profile';
  
  const response = await fetch(`${baseUrl}${apiPath}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  
  if (response.status === 401 || response.status === 403) {
    throw new Error('Unauthorized: Please login again');
  }
  
  if (!response.ok) {
    throw new Error('Failed to update profile');
  }
  
  return response.json();
};

export function ProfileProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const token = localStorage.getItem('zippify_token');

  // Single profile query for the entire app
  const { isLoading, error, data } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    initialData: {
      firstName: 'John',
      lastName: 'Smith',
      storeName: 'Handcrafted Treasures',
      email: '',
      theme: 'light',
    },
  });
  
  // Handle auth errors globally
  React.useEffect(() => {
    if (error) {
      logger.error('Profile fetch failed', { message: error.message });
      if (error instanceof Error && 
          (error.message.includes('Unauthorized') || 
           error.message.includes('No authentication token'))) {
        navigate('/login');
      }
    }
  }, [error, navigate]);

  // Update profile mutation
  const mutation = useMutation({
    mutationFn: updateProfileAPI,
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data);
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update profile: ' + (error as Error).message);
    },
  });

  const contextValue: ProfileContextType = {
    profileData: data,
    isLoading,
    error,
    updateProfile: mutation.mutate,
    isUpdating: mutation.isPending,
  };

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
} 