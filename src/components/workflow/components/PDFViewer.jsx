import React from 'react';
import {
  Box,
  Button,
  VStack,
  Text,
  Flex,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import {
  CopyIcon,
  DownloadIcon,
  AddIcon,
  MinusIcon,
  AttachmentIcon as DocumentIcon
} from '@chakra-ui/icons';

export const PDFViewer = ({
  pdfUrl,
  isLoading,
  onDownload,
  previewText
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const placeholderBg = useColorModeValue('gray.50', 'gray.800');

  if (isLoading) {
    return (
      <Box
        borderWidth={1}
        borderColor={borderColor}
        borderRadius="xl"
        bg={placeholderBg}
        p={8}
        minH="600px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={4}>
          <Icon as={DocumentIcon} boxSize={12} color="gray.400" />
          <Text color="gray.500">Generating PDF preview...</Text>
        </VStack>
      </Box>
    );
  }

  if (!pdfUrl) {
    return (
      <Box
        borderWidth={1}
        borderColor={borderColor}
        borderRadius="xl"
        bg={placeholderBg}
        p={8}
        minH="600px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={4} maxW="md" textAlign="center">
          <Icon as={DocumentIcon} boxSize={12} color="gray.400" />
          <Text color="gray.500" whiteSpace="pre-wrap">
            {previewText || 'PDF preview will appear here'}
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      <Flex gap={2} justify="flex-end">
        <Button
          leftIcon={<ZoomOutIcon />}
          variant="ghost"
          size="sm"
        >
          Zoom Out
        </Button>
        <Button
          leftIcon={<ZoomInIcon />}
          variant="ghost"
          size="sm"
        >
          Zoom In
        </Button>
        <Button
          leftIcon={<DownloadIcon />}
          colorScheme="primary"
          size="sm"
          onClick={onDownload}
        >
          Download PDF
        </Button>
      </Flex>
      
      <Box
        borderWidth={1}
        borderColor={borderColor}
        borderRadius="xl"
        overflow="hidden"
        bg="white"
      >
        <iframe
          src={pdfUrl}
          style={{
            width: '100%',
            height: '600px',
            border: 'none'
          }}
          title="PDF Preview"
        />
      </Box>
    </VStack>
  );
};
