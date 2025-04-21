import React from 'react';

interface FooterProps {
  className?: string;
  variant?: 'default' | 'compact';
}

const Footer: React.FC<FooterProps> = ({ className = '', variant = 'default' }) => {
  return (
    <div className={`bg-background/10 border-t border-border/50 py-4 container px-4 md:px-6 ${className}`}>
      <div className="text-center text-xs text-muted-foreground pt-2">
        &copy; {new Date().getFullYear()} listify.digital. All rights reserved.
      </div>
    </div>
  );
};

export default Footer;
