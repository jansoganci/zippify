import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  Text,
  useToast,
  Flex,
  Progress,
  SimpleGrid,
  useDisclosure
} from '@chakra-ui/react';
import { LoadingTransition } from '../../common/LoadingTransition';
import { DashboardLayout } from '../../layout/DashboardLayout';
import { CopyableText } from '../components/CopyableText';
import { SuccessModal } from '../components/SuccessModal';
import { useNavigate } from 'react-router-dom';

export const EtsyListing = ({ optimizedContent, pdfUrl, onComplete, currentStep, completedSteps }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [listingData, setListingData] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();

  const handleGenerateListing = async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 20, 90));
      }, 1000);

      const response = await fetch('http://localhost:3001/api/generate-etsy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: optimizedContent })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to generate Etsy listing');

      clearInterval(progressInterval);
      setProgress(100);

      if (result.success) {
        setListingData(result);
        toast({
          title: 'Etsy listing generated',
          description: 'The content has been prepared successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setProgress(0);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    handleGenerateListing();
  }, []);

  const handleFinish = () => {
    onComplete(listingData);
    onOpen();
  };

  const handleDownloadPDF = () => {
    if (pdfUrl) window.open(pdfUrl, '_blank');
  };

  const ListingSection = ({ title, content }) => (
    <Box bg="gray.50" p={6} borderRadius="xl" boxShadow="sm">
      <Text fontWeight="semibold" mb={2}>{title}</Text>
      <CopyableText text={content} maxHeight="200px" />
    </Box>
  );

  return (
    <DashboardLayout currentStep="etsy" completedSteps={['optimize', 'pdf']}>
      <LoadingTransition isLoading={isGenerating}>
        <VStack spacing={8} align="stretch" maxW="4xl" mx="auto">

          {/* Header */}
          <Box>
            <Text fontSize="2xl" fontWeight="bold">Step 3: Etsy Listing</Text>
            <Text color="gray.500">The content below has been generated based on your pattern.</Text>
          </Box>

          {/* Loading */}
          {isGenerating && (
            <Box bg="gray.50" p={6} borderRadius="xl" boxShadow="sm">
              <Text fontWeight="medium" mb={2}>Generating listing...</Text>
              <Progress value={progress} size="sm" colorScheme="blue" borderRadius="full" hasStripe isAnimated />
              <Text fontSize="sm" color="gray.500" mt={2}>Please wait while we prepare your content...</Text>
            </Box>
          )}

          {/* Result */}
          {listingData && (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <ListingSection title="Product Description" content={listingData.description} />
              <ListingSection title="Tags & Keywords" content={listingData.tags.join(', ')} />
            </SimpleGrid>
          )}

          {/* Buttons */}
          <Flex justify="flex-end" gap={4}>
            {!listingData && !isGenerating && (
              <Button size="lg" onClick={handleGenerateListing} isLoading={isGenerating}>
                Retry
              </Button>
            )}
            {listingData && (
              <Button size="lg" colorScheme="blue" onClick={handleFinish}>
                Finish
              </Button>
            )}
          </Flex>
        </VStack>
      </LoadingTransition>

      <SuccessModal
        isOpen={isOpen}
        onClose={onClose}
        onDownloadPDF={handleDownloadPDF}
        onGoToDashboard={() => navigate('/dashboard')}
      />
    </DashboardLayout>
  );
};

// Optional default export if needed
export default EtsyListing;