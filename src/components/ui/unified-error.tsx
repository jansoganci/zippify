import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface UnifiedErrorProps {
  error: string | null;
  variant?: 'alert' | 'card' | 'inline';
  showRetry?: boolean;
  onRetry?: () => void;
  className?: string;
}

export function UnifiedError({ 
  error, 
  variant = 'alert', 
  showRetry = false, 
  onRetry,
  className = ''
}: UnifiedErrorProps) {
  if (!error) return null;

  const content = (
    <div className={`flex items-start gap-3 ${className}`}>
      <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-destructive font-medium">{error}</p>
        {showRetry && onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-3"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );

  switch (variant) {
    case 'alert':
      return (
        <Alert variant="destructive" className={className}>
          <AlertDescription>
            {content}
          </AlertDescription>
        </Alert>
      );

    case 'card':
      return (
        <Card className={`bg-destructive/10 border-destructive ${className}`}>
          <CardContent className="p-6">
            {content}
          </CardContent>
        </Card>
      );

    case 'inline':
      return (
        <div className={`bg-destructive/10 text-destructive p-4 rounded-md ${className}`}>
          {content}
        </div>
      );

    default:
      return null;
  }
} 