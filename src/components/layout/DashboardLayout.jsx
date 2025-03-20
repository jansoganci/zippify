import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { Sidebar } from './Sidebar';
import { ProgressBar } from './ProgressBar';
import { PageTransition } from '../common/PageTransition';

export const DashboardLayout = ({ children, currentStep, completedSteps }) => {
  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Sidebar />
      <ProgressBar currentStep={currentStep} completedSteps={completedSteps} />
      <Box
        ml="64" // Sidebar width
        pt="20" // Progress bar height + padding
        p={8}
      >
        <PageTransition>
          {children}
        </PageTransition>
      </Box>
    </Box>
  );
};
