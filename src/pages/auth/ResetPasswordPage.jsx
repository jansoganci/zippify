import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as authService from '../../services/auth/authService';

export const ResetPasswordPage = () => {
  const formBackground = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        status: 'error',
        duration: 3000,
      });
      setIsLoading(false);
      return;
    }

    const token = searchParams.get('token');
    if (!token) {
      toast({
        title: 'Invalid reset link',
        description: 'Please request a new password reset link.',
        status: 'error',
        duration: 5000,
      });
      navigate('/auth/forgot-password');
      return;
    }

    try {
      await authService.resetPassword(newPassword, token);
      toast({
        title: 'Password reset successful',
        description: 'You can now login with your new password.',
        status: 'success',
        duration: 5000,
      });
      navigate('/auth/login');
    } catch (error) {
      toast({
        title: 'Password reset failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
      <Box
        py="8"
        px={{ base: '4', sm: '10' }}
        bg={formBackground}
        boxShadow="lg"
        borderRadius="xl"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <VStack spacing="6">
          <Text fontSize="2xl" fontWeight="bold">
            Create new password
          </Text>
          <form onSubmit={handleResetPassword} style={{ width: '100%' }}>
            <VStack spacing="6" width="full">
              <FormControl isRequired>
                <FormLabel>New Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  size="lg"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  size="lg"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </FormControl>
              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                width="full"
                isLoading={isLoading}
                loadingText="Resetting password..."
              >
                Submit
              </Button>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Container>
  );
};
