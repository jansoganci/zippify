import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  VStack,
  useColorModeValue
} from '@chakra-ui/react';

export const SuccessModal = ({
  isOpen,
  onClose,
  onDownloadPDF,
  onGoToDashboard
}) => {
  const successColor = useColorModeValue('green.500', 'green.300');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      motionPreset="slideInBottom"
    >
      <ModalOverlay
        bg="blackAlpha.300"
        backdropFilter="blur(10px)"
      />
      <ModalContent
        bg="surface"
        boxShadow="xl"
        borderRadius="xl"
        mx={4}
      >
        <ModalHeader pt={6} px={6}>
          <VStack spacing={4} align="center">
            <Text
              fontSize="xl"
              fontWeight="bold"
              textAlign="center"
              color={successColor}
            >
              Workflow Completed Successfully!
            </Text>
          </VStack>
        </ModalHeader>

        <ModalBody py={6} px={6}>
          <VStack spacing={4} align="stretch">
            <Text textAlign="center" color="gray.500">
              Your content has been optimized, PDF has been generated,
              and Etsy listing is ready to use. What would you like to do next?
            </Text>
          </VStack>
        </ModalBody>

        <ModalFooter
          px={6}
          pb={6}
          gap={3}
          flexDirection={{ base: 'column', sm: 'row' }}
        >
          <Button
            colorScheme="primary"
            variant="outline"
            w={{ base: 'full', sm: 'auto' }}
            onClick={() => {
              onDownloadPDF();
              onClose();
            }}
          >
            Download PDF
          </Button>
          <Button
            colorScheme="primary"
            w={{ base: 'full', sm: 'auto' }}
            onClick={() => {
              onGoToDashboard();
              onClose();
            }}
          >
            Go to Dashboard
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};