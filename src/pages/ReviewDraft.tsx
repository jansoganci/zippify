
import { useNavigate } from 'react-router-dom';
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
  
  // This would typically come from a store or context in a real application
  const draftContent = `# Handcrafted Wooden Serving Board

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

  const handleNext = () => {
    navigate('/listing-generation');
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
                DRAFT READY
              </Badge>
            </div>
            
            <ScrollArea className="h-[400px] w-full rounded-md border">
              <div className="p-4 font-mono text-sm whitespace-pre-wrap">
                {draftContent}
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
