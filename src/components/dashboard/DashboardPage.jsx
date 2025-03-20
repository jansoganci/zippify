import React from 'react';
import { Box, Button, Heading, Text, VStack, SimpleGrid, Icon, Flex, Container } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layout/DashboardLayout';
import {
  AddIcon,
  TimeIcon,
  CalendarIcon,
  CopyIcon
} from '@chakra-ui/icons';

const StatCard = ({ icon, label, value }) => (
  <Flex
    direction="column"
    p={6}
    bg="surface"
    borderRadius="xl"
    boxShadow="sm"
    _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
    transition="all 0.2s"
    height="full"
  >
    <Flex align="center" mb={4}>
      <Icon as={icon} boxSize={8} color="primary" />
    </Flex>
    <Text fontSize="sm" color="gray.500" mb={1}>
      {label}
    </Text>
    <Text fontSize="2xl" fontWeight="bold" color="text" mt="auto">
      {value}
    </Text>
  </Flex>
);

export const DashboardPage = () => {
  const navigate = useNavigate();

  const stats = [
    { icon: CopyIcon, label: 'Total Listings', value: '0' },
    { icon: CalendarIcon, label: 'Completed Today', value: '0' },
    { icon: TimeIcon, label: 'Processing', value: '0' }
  ];

  return (
    <DashboardLayout>
      <Container maxW="7xl" py={8} px={{ base: 4, md: 8 }}>
        <VStack spacing={8} align="stretch">
          {/* Welcome Section */}
          <Box
            p={{ base: 6, md: 8 }}
            bg="surface"
            borderRadius="xl"
            boxShadow="sm"
          >
            <Flex
              direction={{ base: 'column', md: 'row' }}
              align={{ base: 'stretch', md: 'center' }}
              justify="space-between"
              gap={6}
            >
              <Box flex="1">
                <Heading size="lg" color="text" mb={4}>
                  Welcome to Zippify
                </Heading>
                <Text color="gray.500">
                  Start by creating your first listing. Our AI will help you optimize your
                  content and generate all the necessary files.
                </Text>
              </Box>
              <Button
                leftIcon={<AddIcon />}
                colorScheme="primary"
                size="lg"
                onClick={() => navigate('/create-listing')}
                w={{ base: 'full', md: 'auto' }}
                minW={{ md: '200px' }}
              >
                Create New Listing
              </Button>
            </Flex>
          </Box>

          {/* Stats Grid */}
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6}>
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </SimpleGrid>

          {/* Recent Activity */}
          <Box
            p={{ base: 6, md: 8 }}
            bg="surface"
            borderRadius="xl"
            boxShadow="sm"
          >
            <VStack spacing={4} align="stretch">
              <Flex justify="space-between" align="center">
                <Heading size="md" color="text">
                  Recent Activity
                </Heading>
                <Button
                  variant="ghost"
                  colorScheme="primary"
                  size="sm"
                  onClick={() => navigate('/my-listings')}
                >
                  View All
                </Button>
              </Flex>
              <Text color="gray.500">
                No recent activity to display.
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </DashboardLayout>
  );
};
