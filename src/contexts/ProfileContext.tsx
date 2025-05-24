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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    // Remove initialData to let real API data load
  });
  
  // Handle auth errors globally
  React.useEffect(() => {
    if (error) {
      logger.error('Profile fetch failed', { message: error.message, error });
      if (error instanceof Error && 
          (error.message.includes('Unauthorized') || 
           error.message.includes('No authentication token'))) {
        navigate('/login');
      }
    }
  }, [error, navigate]);

  // Debug logging for profile state
  React.useEffect(() => {
    logger.info('Profile state update:', { 
      isLoading, 
      hasError: !!error, 
      hasData: !!data, 
      profileData: data 
    });
  }, [isLoading, error, data]);

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