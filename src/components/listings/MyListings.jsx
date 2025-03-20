import React from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';

export const MyListings = () => {
  return (
    <Box p={8}>
      <VStack spacing={4} align="start">
        <Heading size="lg">My Listings</Heading>
        <Text>Your created listings will appear here.</Text>
      </VStack>
    </Box>
  );
};
