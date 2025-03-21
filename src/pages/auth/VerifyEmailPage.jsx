import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Text,
  VStack,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as authService from '../../services/auth/authService';

export const VerifyEmailPage = () => {
  const formBackground = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token);
    }
  }, [searchParams]);

  const verifyEmail = async (token) => {
    setIsLoading(true);
    try {
      await authService.verifyEmail(token);
      setIsVerified(true);
      toast({
        title: 'Email verified',
        description: 'Your email has been successfully verified.',
        status: 'success',
        duration: 5000,
      });
      setTimeout(() => navigate('/auth/login'), 3000);
    } catch (error) {
      toast({
        title: 'Verification failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    try {
      // Note: This assumes your API has a resendVerification endpoint
      await authService.resendVerification();
      toast({
        title: 'Verification email sent',
        description: 'Please check your email for the verification link.',
        status: 'success',
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: 'Failed to resend verification',
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
            {isVerified ? 'Email Verified!' : 'Verify your email'}
          </Text>
          <Text textAlign="center" color="gray.500">
            {isVerified
              ? 'Your email has been successfully verified. Redirecting to login...'
              : "We've sent a verification link to your email address. Please check your inbox and click the link to verify your account."}
          </Text>
          {!isVerified && (
            <>
              <Text textAlign="center" color="gray.500">
                Didn't receive the email?
              </Text>
              <Button
                colorScheme="blue"
                size="lg"
                onClick={handleResendVerification}
                isLoading={isLoading}
                loadingText="Sending verification email..."
                disabled={isVerified}
              >
                Resend verification email
              </Button>
            </>
          )}
        </VStack>
      </Box>
    </Container>
  );
};
