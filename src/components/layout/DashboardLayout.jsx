import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { Sidebar } from './Sidebar';
import { PageTransition } from '../common/PageTransition';
import { Header } from '../common/Header';
import Footer from './Footer';

export const DashboardLayout = ({ children, isDark, onThemeToggle, language, onLanguageChange }) => {
  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')} position="relative">
      <Header
        isDark={isDark}
        onThemeToggle={onThemeToggle}
        language={language}
        onLanguageChange={onLanguageChange}
      />
      <Sidebar />
      <Box
        ml="64" // Sidebar width
        pt="16" // Header height + padding
        pb="16" // Footer height + padding
        p={8}
      >
        <PageTransition>
          {children}
        </PageTransition>
      </Box>
      <Box
        position="absolute"
        bottom={0}
        left="64" // Sidebar width
        right={0}
      >
        <Footer />
      </Box>
    </Box>
  );
};
