import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Container,
  Heading,
} from '@chakra-ui/react';
import { DashboardLayout } from '../layout/DashboardLayout';
import { profileService } from '../../services/profile/profileService';
import { useAuth } from '../../hooks/useAuth.jsx';

export const ProfilePage = () => {
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    store_name: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !user.id) {
      console.log('No user data available:', { user });
      return;
    }
    console.log('Fetching profile for user:', { userId: user.id });

    const loadProfile = async () => {
      try {
        const data = await profileService.getProfile(user.id);
        setProfile(data);
      } catch (error) {
        toast({
          title: 'Error loading profile',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    if (user?.id) {
      loadProfile();
    }
  }, [user?.id, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || !user.id) {
      toast({
        title: 'Authentication Error',
        description: 'User is not authenticated. Please log in again.',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      return;
    }

    console.log('Updating profile for user:', { userId: user.id, profile });
    setIsLoading(true);

    try {
      await profileService.updateProfile(user.id, profile);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error updating profile',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Container maxW="container.md" py={8}>
        <Heading mb={8}>Profile Settings</Heading>
        <Box
          as="form"
          onSubmit={handleSubmit}
          bg="white"
          p={8}
          borderRadius="lg"
          boxShadow="sm"
        >
          <VStack spacing={6}>
            <FormControl id="first_name">
              <FormLabel>First Name</FormLabel>
              <Input
                name="first_name"
                value={profile.first_name}
                onChange={handleChange}
                placeholder="Enter your first name"
              />
            </FormControl>

            <FormControl id="last_name">
              <FormLabel>Last Name</FormLabel>
              <Input
                name="last_name"
                value={profile.last_name}
                onChange={handleChange}
                placeholder="Enter your last name"
              />
            </FormControl>

            <FormControl id="store_name">
              <FormLabel>Store Name</FormLabel>
              <Input
                name="store_name"
                value={profile.store_name}
                onChange={handleChange}
                placeholder="Enter your store name"
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="primary"
              size="lg"
              width="full"
              isLoading={isLoading}
            >
              Save Changes
            </Button>
          </VStack>
        </Box>
      </Container>
    </DashboardLayout>
  );
};
