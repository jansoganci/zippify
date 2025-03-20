import React from 'react';
import { IconButton } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';

export const ThemeToggle = ({ isDark, onToggle }) => {
  return (
    <IconButton
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      variant="ghost"
      size="md"
      icon={isDark ? <SunIcon /> : <MoonIcon />}
      _hover={{ bg: 'surfaceHover' }}
    />
  );
};
