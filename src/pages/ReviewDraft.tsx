import { error } from '../utils/logger';
import { useNavigate, useLocation } from 'react-router-dom';
import { generatePDF } from '@/services/workflow/generatePDF';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';

const ReviewDraft = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [formattedContent, setFormattedContent] = useState('');
  const [errorState, setErrorState] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Get the optimized pattern from the previous page
  const optimizedPattern = location.state?.optimizedPattern || '';
  const originalPattern = location.state?.originalPattern || '';
  
  // If no optimized pattern is provided, use a default pattern
  const draftContent = optimizedPattern || `# Handcrafted Wooden Serving Board

Beautiful, handcrafted wooden serving board made from sustainably harvested maple wood. Each piece is carefully sanded to a smooth finish and treated with food-safe mineral oil.

## Features
- Dimensions: 12" x 8" x 0.75"
- Material: Premium maple wood
- Food-safe finish
- Includes hanging loop
- Each piece has unique grain patterns

Perfect for serving charcuterie, cheese, appetizers, or as a decorative piece in your kitchen. Makes an excellent housewarming or wedding gift.

Care instructions: Hand wash only with mild soap. Periodically treat with food-safe mineral oil to maintain the wood's beauty and durability.`;

  const handleBack = () => {
    navigate('/optimize');
  };

  useEffect(() => {
    // If there's no optimized pattern, don't try to format it
    if (!optimizedPattern) return;
    
  
const formatContent = async () => {
      setIsLoading(true);
      try {
        const result = await generatePDF({ optimizedPattern });
        if (result.success) {
          setFormattedContent(result.pdfContent);
        } else {
          setErrorMsg(result.error || 'Failed to format content');
        }
      } catch (err: any) {
        error('PDF generation error:', err);
        let msg = 'An unexpected error occurred';
        if (typeof err === 'object' && err !== null && err.response?.data) {
          msg = err.response.data.userMessage || err.response.data.message || err.message || msg;
        } else if (typeof err === 'object' && err !== null && err.message) {
          msg = err.message;
        } else if (typeof err === 'string') {
          msg = err;
        }
        setErrorMsg(msg);
      } finally {
        setIsLoading(false);
      }
    };
    
    formatContent();
  }, [optimizedPattern]);

  const handleNext = () => {
    navigate('/listing-generation', {
      state: {
        optimizedPattern,
        originalPattern,
        formattedContent: formattedContent || draftContent
      }
    });
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
                  <BreadcrumbLink href="/optimize">Optimize Pattern</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Step 2 of 3 – Review Draft</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <Progress value={66.66} className="h-2" />
        </div>

        {/* Main content */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">Step 2: Review Your Draft</h1>
          <p className="text-muted-foreground">
            Here is a draft version of your content. Review it before continuing.
          </p>
        </div>
        
        {/* Draft content */}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Your Draft</h2>
              <Badge variant="outline" className="bg-primary/10 text-primary hover:bg-primary/20">
                {isLoading ? 'FORMATTING...' : error ? 'FORMAT ERROR' : 'DRAFT READY'}
              </Badge>
            </div>
            
            <ScrollArea className="h-[400px] w-full rounded-md border">
              <div className="p-4 font-mono text-sm whitespace-pre-wrap">
                {isLoading ? 'Formatting content...' : error ? `Error: ${errorMsg}` : (formattedContent || draftContent)}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        
        {/* Action buttons */}
        <div className="flex justify-between pt-4">
          <Button 
            variant="outline"
            size="lg"
            onClick={handleBack}
          >
            Back
          </Button>
          
          <Button 
            size="lg"
            onClick={handleNext}
          >
            Next Step
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReviewDraft;
