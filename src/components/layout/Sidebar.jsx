import React from 'react';
import { Box, VStack, Icon, Text, Flex } from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ViewIcon,
  AddIcon,
  StarIcon,
  SettingsIcon
} from '@chakra-ui/icons';

const menuItems = [
  { icon: ViewIcon, label: 'Dashboard', path: '/dashboard' },
  { icon: AddIcon, label: 'Create Listing', path: '/create-listing' },
  { icon: StarIcon, label: 'My Listings', path: '/my-listings' },
  { icon: SettingsIcon, label: 'Profile', path: '/profile' }
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const MenuItem = ({ icon, label, path }) => {
    const isActive = location.pathname === path;
    
    return (
      <Flex
        align="center"
        p={3}
        cursor="pointer"
        borderRadius="md"
        role="group"
        onClick={() => navigate(path)}
        bg={isActive ? 'surfaceHover' : 'transparent'}
        color={isActive ? 'primary' : 'text'}
        _hover={{
          bg: 'surfaceHover',
          color: 'primary',
          transform: 'translateX(4px)'
        }}
        transition="all 0.2s"
      >
        <Icon as={icon} boxSize={5} mr={3} />
        <Text fontSize="md" fontWeight={isActive ? 'semibold' : 'medium'}>
          {label}
        </Text>
      </Flex>
    );
  };

  return (
    <Box
      as="nav"
      position="fixed"
      left={0}
      top={0}
      h="100vh"
      w="64"
      bg="surface"
      borderRight="1px"
      borderColor="surfaceHover"
      py={6}
      px={4}
    >
      <VStack spacing={2} align="stretch">
        <Box
          mb={8}
          px={3}
          py={4}
        >
          <Text
            fontSize="2xl"
            fontWeight="bold"
            bgGradient="linear(to-r, primary, accent)"
            bgClip="text"
          >
            Zippify
          </Text>
        </Box>

        {menuItems.map((item) => (
          <MenuItem key={item.path} {...item} />
        ))}
      </VStack>
    </Box>
  );
};
