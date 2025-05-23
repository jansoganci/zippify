import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UnifiedLoadingProps {
  isLoading: boolean;
  loadingText?: string;
  defaultText: string;
  variant?: 'button' | 'inline' | 'overlay';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  children?: React.ReactNode;
}

export function UnifiedLoading({
  isLoading,
  loadingText,
  defaultText,
  variant = 'button',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  children
}: UnifiedLoadingProps) {
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  };

  if (variant === 'button') {
    return (
      <Button
        type={type}
        className={className}
        disabled={isLoading || disabled}
        onClick={onClick}
      >
        {isLoading && (
          <Loader2 className={`${iconSizes[size]} animate-spin mr-2`} />
        )}
        {isLoading ? (loadingText || 'Loading...') : defaultText}
        {children}
      </Button>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {isLoading && (
          <Loader2 className={`${iconSizes[size]} animate-spin text-primary`} />
        )}
        <span className="text-muted-foreground">
          {isLoading ? (loadingText || 'Loading...') : defaultText}
        </span>
      </div>
    );
  }

  if (variant === 'overlay') {
    return isLoading ? (
      <div className={`flex justify-center items-center py-20 ${className}`}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className={`${iconSizes[size]} animate-spin text-primary`} />
          <p className="text-muted-foreground">
            {loadingText || 'Loading...'}
          </p>
        </div>
      </div>
    ) : null;
  }

  return null;
} 