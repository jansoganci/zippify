import React, { useState } from 'react';
import {
  Box,
  Button,
  Text,
  useClipboard,
  Flex,
  Icon,
  Tooltip
} from '@chakra-ui/react';
import { CheckIcon, CopyIcon } from '@chakra-ui/icons';

export const CopyableText = ({
  text,
  label,
  maxHeight = '400px',
  showLineNumbers = false
}) => {
  const { hasCopied, onCopy } = useClipboard(text);
  const [isHovered, setIsHovered] = useState(false);

  const renderContent = () => {
    if (!showLineNumbers) {
      return text;
    }

    return text.split('\n').map((line, index) => (
      <Text key={index} as="div" fontSize="sm">
        <Text as="span" color="gray.500" mr={4}>
          {String(index + 1).padStart(3, '0')}
        </Text>
        {line || '\n'}
      </Text>
    ));
  };

  return (
    <Box position="relative">
      {label && (
        <Text mb={2} fontWeight="medium">
          {label}
        </Text>
      )}
      
      <Box
        position="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Box
          bg="surface"
          borderWidth={1}
          borderRadius="md"
          p={4}
          maxH={maxHeight}
          overflowY="auto"
          fontFamily="mono"
          fontSize="sm"
          whiteSpace="pre-wrap"
          position="relative"
          sx={{
            '&::-webkit-scrollbar': {
              width: '8px',
              borderRadius: '8px',
              backgroundColor: 'transparent'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'gray.200',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: 'gray.300'
              }
            }
          }}
        >
          {renderContent()}
        </Box>

        <Tooltip
          label={hasCopied ? 'Copied!' : 'Copy to clipboard'}
          placement="top"
        >
          <Button
            position="absolute"
            top={2}
            right={2}
            size="sm"
            variant="ghost"
            opacity={isHovered || hasCopied ? 1 : 0}
            onClick={onCopy}
            leftIcon={
              <Icon
                as={hasCopied ? CheckIcon : ClipboardIcon}
                color={hasCopied ? 'green.500' : 'gray.500'}
              />
            }
            _hover={{
              bg: 'surfaceHover'
            }}
            transition="all 0.2s"
          >
            {hasCopied ? 'Copied' : 'Copy'}
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );
};
