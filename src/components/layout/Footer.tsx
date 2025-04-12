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
            &copy; {new Date().getFullYear()} Zippify — All rights reserved.
          </p>
        </div>
      </div>
    );
  }

  // Default variant (for landing page)
  return (
    <div className={`container px-4 md:px-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="text-lg font-bold mb-4">Zippify</div>
          <p className="text-sm text-muted-foreground">
            AI-powered tools to help Etsy sellers create professional listings and boost sales.
          </p>
        </div>
        <div className="flex flex-col space-y-2">
          <div className="text-sm font-bold mb-2">Legal</div>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cookie Policy</a>
        </div>
        <div className="flex flex-col space-y-2">
          <div className="text-sm font-bold mb-2">Company</div>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</a>
        </div>
      </div>
      <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Zippify. All rights reserved.
      </div>
    </div>
  );
};

export default Footer;
