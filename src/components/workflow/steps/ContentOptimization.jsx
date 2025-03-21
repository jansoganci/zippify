import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Textarea,
  VStack,
  Text,
  useToast,
  Flex,
  Spinner,
  Progress
} from '@chakra-ui/react';
import { LoadingTransition } from '../../common/LoadingTransition';
import { ArrowForwardIcon, StarIcon } from '@chakra-ui/icons';
import { DashboardLayout } from '../../layout/DashboardLayout';
import { ProgressBar } from '../../layout/ProgressBar';
import { optimizePattern } from '../../../services/workflow/optimizePattern';

export const ContentOptimization = ({ onComplete, isDark, onThemeToggle, language, onLanguageChange, currentStep, completedSteps }) => {
  const [content, setContent] = useState('');
  const [optimizedContent, setOptimizedContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const toast = useToast();

  const handleOptimize = async () => {
    if (!content.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your content first',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 1000);

      // Call the backend optimization endpoint
      const response = await fetch('http://localhost:3001/api/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to optimize content');
      }

      clearInterval(progressInterval);
      setProgress(100);

      // Update optimized content
      setOptimizedContent(result.optimizedContent);
      
      toast({
        title: 'Success',
        description: 'Content optimized successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Only call onComplete if needed
      onComplete && onComplete(result);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to optimize content',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardLayout
      currentStep="optimize"
      isDark={isDark}
      onThemeToggle={onThemeToggle}
      language={language}
      onLanguageChange={onLanguageChange}
    >
      <ProgressBar currentStep={currentStep} completedSteps={completedSteps} />
      <LoadingTransition isLoading={isProcessing}>
        <VStack spacing={8} align="stretch" maxW="6xl" mx="auto">
          {/* Header */}
          <Box>
            <Text fontSize="2xl" fontWeight="bold" mb={2}>
              Step 1: Content Optimization
            </Text>
            <Text color="gray.500">
              Enter your product description below. Our AI will optimize it for better visibility
              and engagement.
            </Text>
          </Box>

          {/* Two Column Layout */}
          <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
            {/* Left: Input */}
            <Box flex="1">
              <FormControl>
                <FormLabel fontSize="lg">Original Content</FormLabel>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter your content here..."
                  size="lg"
                  minH="300px"
                  disabled={isProcessing}
                  _focus={{
                    borderColor: 'primary',
                    boxShadow: '0 0 0 1px var(--chakra-colors-primary)'
                  }}
                />
              </FormControl>
            </Box>

            {/* Right: Output */}
            <Box flex="1">
              <FormLabel fontSize="lg">Optimized Content</FormLabel>
              <Box 
                p={4} 
                borderRadius="md" 
                bg={isDark ? 'gray.700' : 'gray.50'}
                minH="300px"
                overflowY="auto"
                whiteSpace="pre-wrap"
              >
                {optimizedContent || "Optimized content will appear here..."}
              </Box>
            </Box>
          </Flex>

        {/* Processing Status */}
        {isProcessing && (
          <Box
            bg="surface"
            p={6}
            borderRadius="xl"
            boxShadow="sm"
          >
            <VStack spacing={4} align="stretch">
              <Flex align="center" gap={3}>
                <Spinner size="md" color="primary" />
                <Text fontWeight="medium">Optimizing your content...</Text>
              </Flex>
              <Progress
                value={progress}
                size="sm"
                colorScheme="primary"
                borderRadius="full"
                hasStripe
                isAnimated
              />
              <Text fontSize="sm" color="gray.500">
                This may take a few moments. We're analyzing and enhancing your content.
              </Text>
            </VStack>
          </Box>
        )}

        {/* Action Buttons */}
        <Flex gap={4} justify="flex-end">
          <Button
            leftIcon={<StarIcon />}
            colorScheme="primary"
            size="lg"
            onClick={handleOptimize}
            isLoading={isProcessing}
            loadingText="Optimizing..."
            disabled={!content.trim() || isProcessing}
          >
            Optimize Content
          </Button>
          {!isProcessing && progress === 100 && (
            <Button
              rightIcon={<ArrowRightIcon />}
              colorScheme="primary"
              variant="outline"
              size="lg"
              onClick={() => onComplete()}
            >
              Continue to PDF Generation
            </Button>
          )}
        </Flex>
      </VStack>
    </LoadingTransition>
  </DashboardLayout>
);
};
