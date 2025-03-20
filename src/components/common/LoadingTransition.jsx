import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Spinner } from '@chakra-ui/react';

const loadingVariants = {
  initial: {
    opacity: 0,
    scale: 0.9
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.15,
      ease: 'easeIn'
    }
  }
};

export const LoadingTransition = ({ isLoading, children }) => {
  return (
    <Box position="relative">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            variants={loadingVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(4px)',
              zIndex: 10
            }}
          >
            <Spinner size="lg" />
          </motion.div>
        ) : null}
      </AnimatePresence>
      <motion.div
        animate={{
          opacity: isLoading ? 0.3 : 1,
          scale: isLoading ? 0.98 : 1,
          filter: isLoading ? 'blur(2px)' : 'blur(0px)'
        }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </Box>
  );
};
