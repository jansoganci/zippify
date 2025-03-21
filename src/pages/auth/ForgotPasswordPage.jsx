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
import { useNavigate } from 'react-router-dom';
import * as authService from '../../services/auth/authService';

export const ForgotPasswordPage = () => {
  const formBackground = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const navigate = useNavigate();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      toast({
        title: 'Reset link sent',
        description: 'Please check your email for password reset instructions.',
        status: 'success',
        duration: 5000,
      });
      navigate('/auth/login');
    } catch (error) {
      toast({
        title: 'Request failed',
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
            Reset your password
          </Text>
          <Text textAlign="center" color="gray.500">
            Enter your email address and we'll send you instructions to reset your password.
          </Text>
          <form onSubmit={handleForgotPassword} style={{ width: '100%' }}>
            <VStack spacing="6" width="full">
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  size="lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </FormControl>
              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                width="full"
                isLoading={isLoading}
                loadingText="Sending reset link..."
              >
                Reset Password
              </Button>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Container>
  );
};
