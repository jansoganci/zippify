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
  plan?: string;
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
  
  // Double check token format
  if (!token.startsWith('eyJ')) {
    localStorage.removeItem('zippify_token');
    throw new Error('Invalid authentication token');
  }
  
  let baseUrl = import.meta.env.VITE_API_URL || '';
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  
  const apiPath = baseUrl.includes('/api') ? '/profile' : '/api/profile';
  const fullUrl = `${baseUrl}${apiPath}`;
  
  logger.info('Fetching profile from:', fullUrl);
  
  const response = await fetch(fullUrl, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  logger.info('Profile API response status:', response.status);
  
  if (response.status === 401 || response.status === 403) {
    throw new Error('Unauthorized: Please login again');
  }
  
  if (!response.ok) {
    throw new Error('Failed to fetch profile data');
  }
  
  const responseData = await response.json();
  logger.info('Profile API response:', responseData);
  
  // Backend returns { success: true, firstName: "...", lastName: "...", ... }
  if (responseData.success) {
    const profileData = {
      firstName: responseData.firstName || '',
      lastName: responseData.lastName || '',
      storeName: responseData.storeName || '',
      email: responseData.email || '',
      theme: responseData.theme || 'light',
      plan: responseData.plan || 'free'
    };
    logger.info('Parsed profile data:', profileData);
    return profileData;
  } else {
    throw new Error(responseData.message || 'Failed to fetch profile');
  }
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
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
  
  // Handle auth errors globally - only once per error
  React.useEffect(() => {
    if (error && error instanceof Error) {
      logger.error('Profile fetch failed', { message: error.message, error });
      
      // Only redirect on auth errors, and only once
      if (error.message.includes('Unauthorized') || 
          error.message.includes('No authentication token')) {
        
        // Clear the token and redirect
        localStorage.removeItem('zippify_token');
        
        // Use a timeout to avoid infinite loops
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 100);
      }
    }
  }, [error?.message, navigate]); // Only depend on error message, not whole error object

  // Debug logging for profile state - reduced frequency
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      logger.info('Profile state update:', { 
        isLoading, 
        hasError: !!error, 
        hasData: !!data, 
        profileData: data ? { ...data, email: data.email ? '***' : undefined } : undefined
      });
    }
  }, [isLoading, !!error, !!data]); // Less granular dependencies

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