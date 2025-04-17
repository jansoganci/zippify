import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateEtsyListing } from '@/services/workflow/generateEtsyListing';
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
  const location = useLocation();
  const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [error, setError] = useState('');

  const formattedContent = location.state?.formattedContent || '';

  useEffect(() => {
    if (!formattedContent) return;

    const generateListing = async () => {
      setIsGenerating(true);
      try {
        const result = await generateEtsyListing({ pdfContent: formattedContent });

        if (result.success) {
          setGeneratedContent({
            title: result.title,
            description: result.description,
            tags: result.tags,
            altTexts: result.altTexts
          });
        } else {
          setError(result.error || 'Etsy listing could not be generated.');
          setGeneratedContent(null);
        }
      } catch (error) {
        console.error('Listing generation error:', error);
        setError(error.message || 'An unexpected error occurred');
        setGeneratedContent(null);
      } finally {
        setIsGenerating(false);
      }
    };

    generateListing();
  }, [formattedContent]);

  const handleCopy = (field: string, value: string) => {
    navigator.clipboard.writeText(value)
      .then(() => {
        setCopiedFields(prev => ({ ...prev, [field]: true }));
        toast({
          title: "Copied to clipboard!",
          description: `The ${field} has been copied to your clipboard.`
        });

        setTimeout(() => {
          setCopiedFields(prev => ({ ...prev, [field]: false }));
        }, 2000);
      })
      .catch(() => {
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
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="py-6 space-y-6 page-transition">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem><BreadcrumbLink href="/">Dashboard</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbLink href="/optimize">Optimize Pattern</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbLink href="/review">Review Draft</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage>Step 3 of 3 – Etsy Listing Generation</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <Progress value={100} className="h-2" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Step 3: Etsy Listing Generation</h1>
            <Badge className={isGenerating ? "bg-yellow-500 hover:bg-yellow-600" : error ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}>
              {isGenerating ? (
                <><span className="mr-1 h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> Generating</>
              ) : error ? (
                <><span className="mr-1 h-3 w-3" /> Error</>
              ) : (
                <><Check className="mr-1 h-3 w-3" /> Ready</>
              )}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            The following listing content has been generated based on your draft. You can review and copy each section.
          </p>

          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-md">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {!error && generatedContent && (
          <div className="space-y-6">
            {/* Title */}
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <Label htmlFor="title" className="text-lg font-medium">Title</Label>
                <div className="flex items-start sm:items-center gap-2 flex-col sm:flex-row">
                  <Input
                    id="title"
                    value={isGenerating ? 'Generating...' : (generatedContent?.title || '')}
                    readOnly
                    className="flex-1 bg-muted/40"
                  />
                  <Button variant="outline" size="sm" className="min-w-24" onClick={() => handleCopy('title', generatedContent?.title || '')}>
                    {copiedFields.title ? <><Check className="mr-1 h-4 w-4" /> Copied</> : <><Copy className="mr-1 h-4 w-4" /> Copy</>}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <Label htmlFor="description" className="text-lg font-medium">Description</Label>
                <div className="flex items-start gap-2 flex-col">
                  <Textarea
                    id="description"
                    value={isGenerating ? 'Generating...' : (generatedContent?.description || '')}
                    readOnly
                    className="min-h-[200px] bg-muted/40"
                  />
                  <Button variant="outline" size="sm" className="self-end min-w-24" onClick={() => handleCopy('description', generatedContent?.description || '')}>
                    {copiedFields.description ? <><Check className="mr-1 h-4 w-4" /> Copied</> : <><Copy className="mr-1 h-4 w-4" /> Copy</>}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <Label htmlFor="tags" className="text-lg font-medium">Tags & Keywords</Label>
                <div className="flex items-start sm:items-center gap-2 flex-col sm:flex-row">
                  <Input
                    id="tags"
                    value={Array.isArray(generatedContent?.tags) ? generatedContent.tags.join(', ') : generatedContent?.tags || ''}
                    readOnly
                    className="flex-1 bg-muted/40"
                  />
                  <Button variant="outline" size="sm" className="min-w-24" onClick={() => handleCopy('tags', Array.isArray(generatedContent?.tags) ? generatedContent.tags.join(', ') : generatedContent?.tags || '')}>
                    {copiedFields.tags ? <><Check className="mr-1 h-4 w-4" /> Copied</> : <><Copy className="mr-1 h-4 w-4" /> Copy</>}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Alt Text */}
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <Label htmlFor="altText" className="text-lg font-medium">Alt Text for Images</Label>

                {!generatedContent?.altTexts?.length && (
                  <p className="text-muted-foreground text-sm">No alt text found or still loading...</p>
                )}

                <div className="flex flex-col space-y-4">
                  {generatedContent?.altTexts?.map((text, index) => (
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
                        {copiedFields[`altText-${index}`] ? <><Check className="mr-1 h-4 w-4" /> Copied</> : <><Copy className="mr-1 h-4 w-4" /> Copy</>}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" size="lg" onClick={handleBack}>Back</Button>
          <Button size="lg" onClick={handleFinish}>Finish</Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ListingGeneration;