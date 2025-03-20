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
  Icon,
  useDisclosure
} from '@chakra-ui/react';
import { LoadingTransition } from '../../common/LoadingTransition';
import {
  CheckIcon,
  ViewIcon,
  InfoIcon,
  CopyIcon
} from '@chakra-ui/icons';
import { DashboardLayout } from '../../layout/DashboardLayout';
import { CopyableText } from '../components/CopyableText';
import { SuccessModal } from '../components/SuccessModal';
import { generateEtsyListing } from '../../../services/workflow/generateEtsyListing';
import { useNavigate } from 'react-router-dom';

export const EtsyListing = ({ optimizedContent, pdfUrl, onComplete }) => {
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
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 20, 90));
      }, 1000);

      // Call the Etsy listing generation service
      const result = await generateEtsyListing({
        optimizedPattern: optimizedContent,
        pdfUrl
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (result.success) {
        setListingData(result);
        toast({
          title: 'Success',
          description: 'Etsy listing generated successfully',
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
        description: error.message || 'Failed to generate Etsy listing',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setProgress(0);
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-start listing generation when component mounts
  useEffect(() => {
    handleGenerateListing();
  }, []);

  const handleFinish = () => {
    onComplete(listingData);
    onOpen();
  };

  const handleDownloadPDF = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  const ListingSection = ({ icon, title, content }) => (
    <Box
      bg="surface"
      p={6}
      borderRadius="xl"
      boxShadow="sm"
    >
      <VStack spacing={4} align="stretch">
        <Flex align="center" gap={3}>
          <Icon as={icon} boxSize={5} color="primary" />
          <Text fontWeight="medium">{title}</Text>
        </Flex>
        <CopyableText
          text={content}
          maxHeight="200px"
        />
      </VStack>
    </Box>
  );

  return (
    <DashboardLayout
      currentStep="etsy"
      completedSteps={['optimize', 'pdf']}
    >
      <LoadingTransition isLoading={isGenerating}>
        <VStack spacing={8} align="stretch" maxW="4xl" mx="auto">
        {/* Header */}
        <Box>
          <Text fontSize="2xl" fontWeight="bold" mb={2}>
            Step 3: Etsy Listing
          </Text>
          <Text color="gray.500">
            We've generated an optimized Etsy listing based on your content.
          </Text>
        </Box>

        {/* Processing Status */}
        {isGenerating && (
          <Box
            bg="surface"
            p={6}
            borderRadius="xl"
            boxShadow="sm"
          >
            <VStack spacing={4} align="stretch">
              <Flex align="center" gap={3}>
                <ShoppingBagIcon boxSize={5} color="primary" />
                <Text fontWeight="medium">Generating Etsy Listing...</Text>
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
                We're creating an SEO-optimized listing for your Etsy shop.
              </Text>
            </VStack>
          </Box>
        )}

        {/* Listing Content */}
        {listingData && (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <ListingSection
              icon={DocumentTextIcon}
              title="Product Description"
              content={listingData.description}
            />
            <ListingSection
              icon={TagIcon}
              title="Tags & Keywords"
              content={listingData.tags.join('\n')}
            />
          </SimpleGrid>
        )}

        {/* Action Buttons */}
        <Flex gap={4} justify="flex-end">
          {!listingData && !isGenerating && (
            <Button
              leftIcon={<ShoppingBagIcon />}
              colorScheme="primary"
              size="lg"
              onClick={handleGenerateListing}
              isLoading={isGenerating}
              loadingText="Generating..."
            >
              Retry Generation
            </Button>
          )}
          {listingData && (
            <Button
              leftIcon={<CheckCircleIcon />}
              colorScheme="primary"
              size="lg"
              onClick={handleFinish}
            >
              Finish
            </Button>
          )}
        </Flex>
      </VStack>
      </LoadingTransition>

      {/* Success Modal */}
      <SuccessModal
        isOpen={isOpen}
        onClose={onClose}
        onDownloadPDF={handleDownloadPDF}
        onGoToDashboard={() => navigate('/dashboard')}
      />
    </DashboardLayout>
  );
};
