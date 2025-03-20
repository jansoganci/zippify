import React from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';

export const Profile = () => {
  return (
    <Box p={8}>
      <VStack spacing={4} align="start">
        <Heading size="lg">Profile</Heading>
        <Text>Your profile settings and preferences will appear here.</Text>
      </VStack>
    </Box>
  );
};
