
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Check, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ListingGeneration = () => {
  const navigate = useNavigate();
  const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({});

  // Generated content - would normally come from context or state
  const generatedContent = {
    title: "Handcrafted Wooden Serving Board - Premium Maple Charcuterie Platter - Unique Kitchen Gift",
    description: `# Handcrafted Wooden Serving Board

Beautiful, handcrafted wooden serving board made from sustainably harvested maple wood. Each piece is carefully sanded to a smooth finish and treated with food-safe mineral oil.

## Features
- Dimensions: 12" x 8" x 0.75"
- Material: Premium maple wood
- Food-safe finish
- Includes hanging loop
- Each piece has unique grain patterns

Perfect for serving charcuterie, cheese, appetizers, or as a decorative piece in your kitchen. Makes an excellent housewarming or wedding gift.

Care instructions: Hand wash only with mild soap. Periodically treat with food-safe mineral oil to maintain the wood's beauty and durability.`,
    tags: "wood serving board, maple charcuterie board, handcrafted kitchen, wooden platter, food safe board, artisan wood, kitchen gift, sustainable maple, unique grain, handmade gift",
    altTexts: [
      "Handcrafted wooden serving board made from maple with beautiful grain pattern",
      "Maple wood charcuterie board shown with cheese and fruits",
      "Close-up of smooth finish on premium wooden serving platter"
    ]
  };

  const handleCopy = (field: string, value: string) => {
    navigator.clipboard.writeText(value)
      .then(() => {
        setCopiedFields(prev => ({ ...prev, [field]: true }));
        toast({
          title: "Copied to clipboard!",
          description: `The ${field} has been copied to your clipboard.`
        });
        
        // Reset the copied status after 2 seconds
        setTimeout(() => {
          setCopiedFields(prev => ({ ...prev, [field]: false }));
        }, 2000);
      })
      .catch(err => {
        toast({
          title: "Error copying to clipboard",
          description: "Please try again or copy manually.",
          variant: "destructive"
        });
      });
  };

  const handleBack = () => {
    navigate('/review');
  };

  const handleFinish = () => {
    toast({
      title: "Success!",
      description: "Your listing has been generated. Redirecting to dashboard...",
    });
    
    // Redirect to dashboard after a short delay
    setTimeout(() => {
      navigate('/');
    }, 1500);
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
                  <BreadcrumbLink href="/review">Review Draft</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Step 3 of 3 – Etsy Listing Generation</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <Progress value={100} className="h-2" />
        </div>

        {/* Main content */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Step 3: Etsy Listing Generation</h1>
            <Badge className="bg-green-500 hover:bg-green-600">
              <Check className="mr-1 h-3 w-3" /> Ready
            </Badge>
          </div>
          <p className="text-muted-foreground">
            The following listing content has been generated based on your draft. You can review and copy each section.
          </p>
        </div>
        
        {/* Generated sections */}
        <div className="space-y-6">
          {/* Title */}
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="title" className="text-lg font-medium">Title</Label>
                <div className="flex items-start sm:items-center gap-2 flex-col sm:flex-row">
                  <Input 
                    id="title"
                    value={generatedContent.title} 
                    readOnly
                    className="flex-1 bg-muted/40"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="min-w-24"
                    onClick={() => handleCopy('title', generatedContent.title)}
                  >
                    {copiedFields.title ? (
                      <>
                        <Check className="mr-1 h-4 w-4" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-4 w-4" /> Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="description" className="text-lg font-medium">Description</Label>
                <div className="flex items-start gap-2 flex-col">
                  <Textarea 
                    id="description"
                    value={generatedContent.description} 
                    readOnly
                    className="min-h-[200px] bg-muted/40"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="self-end min-w-24"
                    onClick={() => handleCopy('description', generatedContent.description)}
                  >
                    {copiedFields.description ? (
                      <>
                        <Check className="mr-1 h-4 w-4" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-4 w-4" /> Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags & Keywords */}
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="tags" className="text-lg font-medium">Tags & Keywords</Label>
                <div className="flex items-start sm:items-center gap-2 flex-col sm:flex-row">
                  <Input 
                    id="tags"
                    value={generatedContent.tags} 
                    readOnly
                    className="flex-1 bg-muted/40"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="min-w-24"
                    onClick={() => handleCopy('tags', generatedContent.tags)}
                  >
                    {copiedFields.tags ? (
                      <>
                        <Check className="mr-1 h-4 w-4" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-4 w-4" /> Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alt Text */}
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="altText" className="text-lg font-medium">Alt Text for Images</Label>
                <div className="flex flex-col space-y-4">
                  {generatedContent.altTexts.map((text, index) => (
                    <div key={index} className="flex items-start sm:items-center gap-2 flex-col sm:flex-row">
                      <Input 
                        id={`altText-${index}`}
                        value={text} 
                        readOnly
                        className="flex-1 bg-muted/40"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="min-w-24"
                        onClick={() => handleCopy(`altText-${index}`, text)}
                      >
                        {copiedFields[`altText-${index}`] ? (
                          <>
                            <Check className="mr-1 h-4 w-4" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1 h-4 w-4" /> Copy
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
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
            onClick={handleFinish}
          >
            Finish
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ListingGeneration;
