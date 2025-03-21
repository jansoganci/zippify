import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  Text,
  useToast,
  Flex,
  Progress,
  Badge,
  Divider
} from '@chakra-ui/react';
import { LoadingTransition } from '../../common/LoadingTransition';
import { ArrowForwardIcon, CopyIcon, AttachmentIcon as DocumentIcon } from '@chakra-ui/icons';
import { DashboardLayout } from '../../layout/DashboardLayout';
import { ProgressBar } from '../../layout/ProgressBar';
import { PDFViewer } from '../components/PDFViewer';
import { generatePDF } from '../../../services/workflow/generatePDF';

export const PDFGeneration = ({ optimizedContent, onComplete, currentStep, completedSteps }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pdfUrl, setPdfUrl] = useState(null);
  const toast = useToast();

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 15, 90));
      }, 1000);

      // Call the backend PDF generation endpoint
      const response = await fetch('http://localhost:3001/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: optimizedContent })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate PDF');
      }

      clearInterval(progressInterval);
      setProgress(100);

      setPdfUrl(result.pdfContent);
      toast({
        title: 'Success',
        description: 'PDF generated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate PDF',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setProgress(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  // Auto-start PDF generation when component mounts
  useEffect(() => {
    handleGeneratePDF();
  }, []);

  return (
    <DashboardLayout currentStep="pdf" completedSteps={['optimize']}>
      <ProgressBar currentStep={currentStep} completedSteps={completedSteps} />
      <LoadingTransition isLoading={isGenerating}>
        <VStack spacing={8} align="stretch" maxW="4xl" mx="auto">
        {/* Header */}
        <Box>
          <Text fontSize="2xl" fontWeight="bold" mb={2}>
            Step 2: PDF Generation
          </Text>
          <Text color="gray.500">
            We're converting your optimized content into a professional PDF format.
          </Text>
        </Box>

        {/* Content Summary */}
        <Box
          bg="surface"
          p={6}
          borderRadius="xl"
          boxShadow="sm"
        >
          <VStack spacing={4} align="stretch">
            <Flex justify="space-between" align="center">
              <Text fontWeight="medium">Optimized Content</Text>
              <Badge colorScheme="green">Ready</Badge>
            </Flex>
            <Divider />
            <Text noOfLines={3} color="gray.500">
              {optimizedContent}
            </Text>
          </VStack>
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
                <DocumentIcon boxSize={5} color="primary" />
                <Text fontWeight="medium">Generating PDF...</Text>
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
                Please wait while we format your content into a PDF.
              </Text>
            </VStack>
          </Box>
        )}

        {/* PDF Preview */}
        <Box
          bg="surface"
          p={6}
          borderRadius="xl"
          boxShadow="sm"
        >
          <VStack spacing={4} align="stretch">
            <Text fontWeight="medium" mb={2}>PDF Preview</Text>
            <PDFViewer
              pdfUrl={pdfUrl}
              isLoading={isGenerating}
              onDownload={handleDownload}
              previewText={
                !isGenerating && !pdfUrl
                  ? "We couldn't generate the PDF. Please try again."
                  : undefined
              }
            />
          </VStack>
        </Box>

        {/* Action Buttons */}
        <Flex gap={4} justify="flex-end">
          {!pdfUrl && !isGenerating && (
            <Button
              leftIcon={<DocumentIcon />}
              colorScheme="primary"
              size="lg"
              onClick={handleGeneratePDF}
              isLoading={isGenerating}
              loadingText="Generating..."
            >
              Retry PDF Generation
            </Button>
          )}
          {pdfUrl && (
            <>
              <Button
                leftIcon={<DocumentIcon />}
                colorScheme="primary"
                variant="outline"
                size="lg"
                onClick={handleDownload}
              >
                Download PDF
              </Button>
              <Button
                rightIcon={<ArrowRightIcon />}
                colorScheme="primary"
                size="lg"
                onClick={() => onComplete({ pdfUrl })}
              >
                Continue to Etsy Listing
              </Button>
            </>
          )}
        </Flex>
        </VStack>
      </LoadingTransition>
    </DashboardLayout>
  );
};
