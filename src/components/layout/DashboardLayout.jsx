import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { Sidebar } from './Sidebar';
import { PageTransition } from '../common/PageTransition';
import { Header } from '../common/Header';
import Footer from './Footer';

export const DashboardLayout = ({ children, language, onLanguageChange }) => {
  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')} position="relative">
      <Header
        language={language}
        onLanguageChange={onLanguageChange}
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={1000}
      />
      <Sidebar position="fixed" top={16} left={0} height="calc(100vh - 16px)" zIndex={999} />
      <Box
        ml={64} // Sidebar width
        mt={16} // Header height
        minH="calc(100vh - 16px)" // Full height minus header
        position="relative"
        p={8}
      >
        <PageTransition>
          {children}
        </PageTransition>
        <Box
          position="sticky"
          bottom={0}
          left={0}
          right={0}
          mt={8}
          bg={useColorModeValue('gray.50', 'gray.900')}
        >
          <Footer />
        </Box>
      </Box>
    </Box>
  );
};
