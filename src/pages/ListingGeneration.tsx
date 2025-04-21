import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateEtsyListing } from '@/services/workflow/generateEtsyListing';
import { error } from '../utils/logger';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import ListingResultPreview from '@/features/etsyListing/components/ListingResultPreview';
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
  const [errorMsg, setErrorMsg] = useState('');

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
          setErrorMsg(result.error || 'Etsy listing could not be generated.');
          setGeneratedContent(null);
        }
      } catch (err: any) {
        error('Listing generation error:', err);
        let msg = 'An unexpected error occurred';
        if (typeof err === 'object' && err !== null && err.response?.data) {
          msg = err.response.data.userMessage || err.response.data.message || err.message || msg;
        } else if (typeof err === 'object' && err !== null && err.message) {
          msg = err.message;
        } else if (typeof err === 'string') {
          msg = err;
        }
        setErrorMsg(msg);
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
            <Badge className={isGenerating ? "bg-yellow-500 hover:bg-yellow-600" : errorMsg ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}>
              {isGenerating ? (
                <><span className="mr-1 h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> Generating</>
              ) : errorMsg ? (
                <><span className="mr-1 h-3 w-3" /> Error</>
              ) : (
                <><Check className="mr-1 h-3 w-3" /> Ready</>
              )}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            The following listing content has been generated based on your draft. You can review and copy each section.
          </p>

          {errorMsg && (
            <div className="bg-red-100 text-red-700 p-4 rounded-md">
              <strong>Error:</strong> {errorMsg}
            </div>
          )}
        </div>

        {!errorMsg && generatedContent && (
          <div className="space-y-6">
            {generatedContent && (
              <ListingResultPreview
                title={generatedContent.title}
                description={generatedContent.description}
                tags={Array.isArray(generatedContent.tags) ? generatedContent.tags : []}
                altTexts={Array.isArray(generatedContent.altTexts) ? generatedContent.altTexts : []}
              />
            )}
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