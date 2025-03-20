import React from 'react';
import { Box, Flex, Text, Hide, Show } from '@chakra-ui/react';
import { Navigation } from './Navigation';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';

export const Header = ({ isDark, onThemeToggle, language, onLanguageChange }) => {
  return (
    <Box
      as="header"
      position="fixed"
      top={0}
      left={0}
      right={0}
      py={4}
      px={6}
      bg="surface"
      borderBottom="1px"
      borderColor="surfaceHover"
      zIndex={10}
    >
      <Flex justify="space-between" align="center" maxW="7xl" mx="auto">
        <Text
          fontSize="xl"
          fontWeight="bold"
          bgGradient="linear(to-r, primary, accent)"
          bgClip="text"
        >
          Zippify
        </Text>
        
        <Flex gap={4} align="center">
          <Hide below="md">
            <Navigation />
          </Hide>
          <Flex gap={4} align="center">
            <LanguageSwitcher
              currentLanguage={language}
              onLanguageChange={onLanguageChange}
            />
            <ThemeToggle isDark={isDark} onToggle={onThemeToggle} />
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};
