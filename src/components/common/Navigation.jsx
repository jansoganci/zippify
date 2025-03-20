import React from 'react';
import { Button, HStack } from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Create Listing', path: '/create-listing' },
  { label: 'My Listings', path: '/my-listings' },
  { label: 'Profile', path: '/profile' }
];

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <HStack spacing={4}>
      {navItems.map(({ label, path }) => (
        <Button
          key={path}
          variant={location.pathname === path ? 'solid' : 'ghost'}
          colorScheme="primary"
          size="sm"
          onClick={() => navigate(path)}
        >
          {label}
        </Button>
      ))}
    </HStack>
  );
};
