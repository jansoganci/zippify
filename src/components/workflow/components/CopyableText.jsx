import React from 'react';
import {
  Box,
  Button,
  Text,
  useClipboard,
} from '@chakra-ui/react';

export const CopyableText = ({ text, label, maxHeight = '400px' }) => {
  const { hasCopied, onCopy } = useClipboard(text);

  return (
    <Box>
      {label && (
        <Text mb={2} fontWeight="medium">
          {label}
        </Text>
      )}

      <Box
        bg="gray.50"
        borderWidth={1}
        borderRadius="md"
        p={4}
        maxH={maxHeight}
        overflowY="auto"
        fontFamily="mono"
        fontSize="sm"
        whiteSpace="pre-wrap"
        mb={4}
      >
        {text}
      </Box>

      <Button onClick={onCopy} size="sm" colorScheme="blue" variant="solid">
        {hasCopied ? 'Copied!' : 'Copy'}
      </Button>
    </Box>
  );
};