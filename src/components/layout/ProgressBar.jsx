import React from 'react';
import { Box, Flex, Text, Progress, useColorModeValue } from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';

const steps = [
  { id: 'optimize', label: 'Optimize Pattern' },
  { id: 'pdf', label: 'Generate PDF' },
  { id: 'etsy', label: 'Create Etsy Listing' }
];

export const ProgressBar = ({ currentStep, completedSteps = [] }) => {
  const getStepStatus = (stepId) => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (currentStep === stepId) return 'current';
    return 'pending';
  };

  return (
    <Box
      position="fixed"
      top={0}
      left="64" // Sidebar width
      right={0}
      bg={useColorModeValue('white', 'gray.800')}
      borderBottom="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      zIndex={10}
    >
      <Flex maxW="4xl" mx="auto" px={6} py={4} align="center">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step indicator */}
            <Flex
              direction="column"
              align="center"
              flex={1}
              position="relative"
            >
              <Box
                w={8}
                h={8}
                borderRadius="full"
                bg={getStepStatus(step.id) === 'completed' ? 'primary' : 'surface'}
                border="2px"
                borderColor={
                  getStepStatus(step.id) === 'current'
                    ? 'primary'
                    : getStepStatus(step.id) === 'completed'
                    ? 'primary'
                    : 'surfaceHover'
                }
                display="flex"
                alignItems="center"
                justifyContent="center"
                position="relative"
                zIndex={1}
              >
                {getStepStatus(step.id) === 'completed' ? (
                  <CheckCircleIcon color="white" />
                ) : (
                  <Text
                    color={
                      getStepStatus(step.id) === 'current'
                        ? 'primary'
                        : 'text'
                    }
                  >
                    {index + 1}
                  </Text>
                )}
              </Box>
              
              <Text
                mt={2}
                fontSize="sm"
                fontWeight={
                  getStepStatus(step.id) === 'current' ? 'semibold' : 'medium'
                }
                color={
                  getStepStatus(step.id) === 'completed'
                    ? 'primary'
                    : getStepStatus(step.id) === 'current'
                    ? 'text'
                    : 'gray.500'
                }
              >
                {step.label}
              </Text>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <Progress
                  value={
                    getStepStatus(step.id) === 'completed' ? 100 : 
                    getStepStatus(step.id) === 'current' ? 50 : 0
                  }
                  size="xs"
                  colorScheme="primary"
                  position="absolute"
                  top="14px"
                  left="50%"
                  width="100%"
                  zIndex={0}
                />
              )}
            </Flex>
          </React.Fragment>
        ))}
      </Flex>
    </Box>
  );
};
