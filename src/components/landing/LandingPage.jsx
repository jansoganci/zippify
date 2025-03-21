import React from 'react';
import { Box, Button, Container, Heading, Text, VStack, Grid, Flex, Icon } from '@chakra-ui/react';
import { ArrowRightIcon } from '@chakra-ui/icons';
import { Header } from '../common/Header';
import Footer from '../layout/Footer';
import { useNavigate } from 'react-router-dom';

export const LandingPage = ({ isDark, onThemeToggle, language, onLanguageChange }) => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  return (
    <Box minH="100vh" bg="background" position="relative" pb="16">
      <Header
        isDark={isDark}
        onThemeToggle={onThemeToggle}
        language={language}
        onLanguageChange={onLanguageChange}
      />

      {/* Hero Section */}
      <Container maxW="7xl" pt={{ base: 24, md: 32 }} px={{ base: 4, md: 8 }}>
        <Grid
          templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
          gap={{ base: 8, lg: 16 }}
          alignItems="center"
          mb={{ base: 16, md: 24 }}
        >
          <Box>
            <Heading
              as="h1"
              size="2xl"
              fontWeight="bold"
              bgGradient="linear(to-r, primary, accent)"
              bgClip="text"
              lineHeight="shorter"
              mb={6}
            >
              Automate Your Etsy Listings
            </Heading>

            <Text fontSize="xl" color="text" mb={8}>
              Generate optimized descriptions, PDFs, and ZIP files in minutes.
              Streamline your e-commerce workflow with AI-powered automation.
            </Text>

            <Button
              size="lg"
              colorScheme="primary"
              rightIcon={<ArrowRightIcon />}
              onClick={handleGetStarted}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
              _active={{
                transform: 'translateY(0)',
              }}
              transition="all 0.2s"
              px={8}
            >
              Start Now
            </Button>
          </Box>

          {/* Placeholder for hero image or animation */}
          <Flex
            display={{ base: 'none', lg: 'flex' }}
            justify="center"
            align="center"
            bg="surfaceHover"
            borderRadius="2xl"
            p={8}
            minH="400px"
          >
            <Text color="text" fontSize="lg" fontStyle="italic">
              [Hero Illustration]
            </Text>
          </Flex>
        </Grid>

        {/* Features Section */}
        <Box
          as="section"
          py={{ base: 12, md: 16 }}
          px={{ base: 6, md: 8 }}
          borderRadius="xl"
          bg="surface"
          boxShadow="xl"
        >
          <VStack spacing={{ base: 8, md: 12 }} align="stretch">
            <Heading
              as="h2"
              size="lg"
              color="text"
              textAlign="center"
              mb={{ base: 6, md: 8 }}
            >
              Why Choose Zippify?
            </Heading>

            <Grid
              templateColumns={{
                base: '1fr',
                md: 'repeat(3, 1fr)'
              }}
              gap={{ base: 8, md: 6 }}
            >
              {[
                {
                  title: 'Save Time',
                  description: 'Automate repetitive tasks and focus on growing your business'
                },
                {
                  title: 'Optimize Content',
                  description: 'AI-powered descriptions and SEO-friendly listings'
                },
                {
                  title: 'Instant Downloads',
                  description: 'Get your files ready in minutes, not hours'
                }
              ].map((feature, index) => (
                <Box
                  key={index}
                  p={6}
                  borderRadius="lg"
                  bg="surfaceHover"
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'md'
                  }}
                  transition="all 0.2s"
                >
                  <Text
                    fontWeight="bold"
                    fontSize="lg"
                    color="primary"
                    mb={3}
                  >
                    {feature.title}
                  </Text>
                  <Text color="text">
                    {feature.description}
                  </Text>
                </Box>
              ))}
            </Grid>
          </VStack>
        </Box>
      </Container>
      <Box position="absolute" bottom={0} left={0} right={0}>
        <Footer />
      </Box>
    </Box>
  );
};
