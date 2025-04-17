import React from 'react';

interface FooterProps {
  className?: string;
  variant?: 'default' | 'compact';
}

const Footer: React.FC<FooterProps> = ({ className = '', variant = 'default' }) => {
  if (variant === 'compact') {
    return (
      <div className={`w-full h-8 ${className}`}>
        <div className="container flex items-center justify-center h-full">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} listify.digital — All rights reserved.
          </p>
        </div>
      </div>
    );
  }

  // Default variant (for landing page)
  return (
    <div className={`bg-background/10 border-t border-border/50 py-4 container px-4 md:px-6 ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <div>
          <div className="text-sm font-medium text-muted-foreground">listify.digital</div>
          <p className="text-xs text-muted-foreground text-center">AI-powered tools to help Etsy sellers create professional listings and boost sales.</p>
        </div>
        <div className="space-y-2 text-center">
          <div className="text-xs font-medium text-muted-foreground mb-1">Legal</div>
          <div className="flex flex-col space-y-1">
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Cookie Policy</a>
          </div>
        </div>
        <div className="space-y-2 text-center">
          <div className="text-xs font-medium text-muted-foreground mb-1">Company</div>
          <div className="flex flex-col space-y-1">
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">About Us</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Contact</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Blog</a>
          </div>
        </div>
      </div>
      <div className="text-center text-xs text-muted-foreground pt-2">
        &copy; {new Date().getFullYear()} listify.digital. All rights reserved.
      </div>
    </div>
  );
};

export default Footer;
