import React from 'react';
import { motion, LazyMotion, domAnimation } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 15,
    scale: 0.98
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.25,
      ease: [0.25, 0.1, 0.25, 1.0], // Custom cubic bezier
      when: 'beforeChildren'
    }
  },
  exit: {
    opacity: 0,
    y: -15,
    scale: 0.98,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1.0],
      when: 'afterChildren'
    }
  }
};

export const PageTransition = ({ children }) => {
  return (
    <LazyMotion features={domAnimation}>
      <motion.div
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageVariants}
        layout
        style={{
          width: '100%',
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
          WebkitFontSmoothing: 'subpixel-antialiased'
        }}
      >
        {children}
      </motion.div>
    </LazyMotion>
  );
};
