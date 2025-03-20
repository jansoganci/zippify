import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    primary: {
      50: '#F0F7FF',
      100: '#C2E0FF',
      200: '#94CBFF',
      300: '#66B2FF',
      400: '#4F46E5',
      500: '#6366F1',
      600: '#4338CA',
      700: '#3730A3',
      800: '#312E81',
      900: '#1E1B4B',
    }
  },
  semanticTokens: {
    colors: {
      primary: {
        default: 'primary.400',
        _dark: 'primary.500',
      },
      accent: {
        default: '#10B981',
        _dark: '#34D399',
      },
      error: {
        default: '#EF4444',
        _dark: '#F87171',
      },
      surface: {
        default: '#FFFFFF',
        _dark: '#1F2937',
      },
      surfaceHover: {
        default: '#F3F4F6',
        _dark: '#374151',
      },
      text: {
        default: '#111827',
        _dark: '#F9FAFB',
      }
    }
  },
  styles: {
    global: (props) => ({
      body: {
        bg: 'surface',
        color: 'text'
      }
    })
  }
});
