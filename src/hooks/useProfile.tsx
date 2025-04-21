
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ProfileData {
  firstName: string;
  lastName: string;
  storeName: string;
}

// API functions with authentication
const fetchProfile = async (): Promise<ProfileData> => {
  const token = localStorage.getItem('zippify_token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  const response = await fetch('/profile', {
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

const updateProfile = async (data: ProfileData): Promise<ProfileData> => {
  const token = localStorage.getItem('zippify_token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  const response = await fetch('/profile', {
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

export function useProfile() {
  // Get QueryClient from the context
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Check for token on component mount
  useEffect(() => {
    const token = localStorage.getItem('zippify_token');
    if (!token) {
      if (import.meta.env.MODE !== 'production') console.warn('No authentication token found, redirecting to login');
      navigate('/login');
    }
  }, [navigate]);
  
  // Default values while loading
  const [formData, setFormData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    storeName: '',
  });

  // Fetch profile data
  const { isLoading, error, data } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    initialData: {
      firstName: 'John',
      lastName: 'Smith',
      storeName: 'Handcrafted Treasures',
    },
  });
  
  // Handle query errors
  useEffect(() => {
    if (error) {
      if (import.meta.env.MODE !== 'production') console.error('Profile fetch error:', error);
      if (error instanceof Error && 
          (error.message.includes('Unauthorized') || 
           error.message.includes('No authentication token'))) {
        navigate('/login');
      }
    }
  }, [error, navigate]);

  // Update form data when query data changes
  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  // Update profile mutation
  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // Update cache with the new data
      queryClient.setQueryData(['profile'], data);
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update profile: ' + (error as Error).message);
    },
  });

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return {
    profileData: data,
    formData,
    handleChange,
    handleSubmit,
    isLoading,
    isUpdating: mutation.isPending,
    error
  };
}