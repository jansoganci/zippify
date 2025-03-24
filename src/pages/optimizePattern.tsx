
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const OptimizePattern = () => {
  const navigate = useNavigate();
  const [originalContent, setOriginalContent] = useState('');
  const [optimizedContent, setOptimizedContent] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);

  const handleOptimize = () => {
    if (!originalContent.trim()) return;
    
    setIsOptimizing(true);
    
    // Simulate optimization process
    setTimeout(() => {
      setOptimizedContent(
        `${originalContent.trim()}\n\nOptimized with better keywords and SEO-friendly terms to improve visibility on Etsy's marketplace. This description now includes relevant search terms and follows best practices for product listings.`
      );
      setIsOptimizing(false);
      setIsOptimized(true);
    }, 1500);
  };

  const handleNext = () => {
    // Navigate to the next step
    navigate('/create');
  };

  return (
    <DashboardLayout>
      <div className="py-6 space-y-6 page-transition">
        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Step 1 of 3 – Optimize Pattern</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <Progress value={33.33} className="h-2" />
        </div>

        {/* Main content */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">Optimize Your Product Description</h1>
          <p className="text-muted-foreground">
            Enter your product description below. Our AI will optimize it for better visibility.
          </p>
        </div>
        
        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Original content column */}
          <div className="space-y-3">
            <h2 className="text-lg font-medium">Original Content</h2>
            <Card className="h-full">
              <CardContent className="pt-6">
                <Textarea 
                  className="min-h-[300px] resize-none"
                  placeholder="Enter your product description here. Include details about materials, dimensions, and any special features."
                  value={originalContent}
                  onChange={(e) => setOriginalContent(e.target.value)}
                  disabled={isOptimizing}
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Optimized content column */}
          <div className="space-y-3">
            <h2 className="text-lg font-medium">Optimized Content</h2>
            <Card className="h-full">
              <CardContent className="pt-6">
                <Textarea 
                  className="min-h-[300px] resize-none bg-muted/40"
                  placeholder="Optimized content will appear here after processing..."
                  value={optimizedContent}
                  readOnly
                />
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-between pt-4">
          <Button 
            size="lg"
            onClick={handleOptimize}
            disabled={!originalContent.trim() || isOptimizing}
            className="relative"
          >
            {isOptimizing ? 'Optimizing...' : 'Optimize Content'}
            {isOptimizing && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
          </Button>
          
          {isOptimized && (
            <Button 
              variant="secondary"
              size="lg"
              onClick={handleNext}
            >
              Next Step
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OptimizePattern;
