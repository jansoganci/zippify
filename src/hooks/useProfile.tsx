
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ProfileData {
  firstName: string;
  lastName: string;
  storeName: string;
}

// Simulated API functions (replace with actual API calls)
const fetchProfile = async (): Promise<ProfileData> => {
  const response = await fetch('/api/profile');
  if (!response.ok) {
    throw new Error('Failed to fetch profile data');
  }
  return response.json();
};

const updateProfile = async (data: ProfileData): Promise<ProfileData> => {
  const response = await fetch('/api/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update profile');
  }
  
  return response.json();
};

export function useProfile() {
  // Get QueryClient from the context
  const queryClient = useQueryClient();
  
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
    // When we successfully fetch data, update the form
    onSuccess: (data) => {
      setFormData(data);
    },
    // For demo purposes, simulate API with mock data if API is not available
    initialData: {
      firstName: 'John',
      lastName: 'Smith',
      storeName: 'Handcrafted Treasures',
    },
  });

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
