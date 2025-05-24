import React, { useState, useEffect, useCallback } from "react";
import DashboardLayoutFixed from "@/components/DashboardLayoutFixed";
import { useSeoKeywords } from "../context/KeywordContext";
import { createLogger } from "@/utils/logger";
import PromptInput from "../components/PromptInput";
import KeywordSelector from "../components/KeywordSelector";
import GeneratedListingOutput from "../components/GeneratedListingOutput";
import SamplePromptList from "../components/SamplePromptList";

import { generateTitle } from "../services/generateTitle";
import { generateDescription } from "../services/generateDescription";
import { generateTags } from "../services/generateTags";
import { generateAltText } from "../services/generateAltText";
import { createListing } from "../services/backendApi";
import { backendApi } from "@/services/workflow/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus, FileText, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// Create component-specific logger
const logger = createLogger('CreateListing');

interface ListingResult {
  title: string;
  description: string;
  keywords: string[];
  altText: string;
}

const CreateListing: React.FC = () => {
  // Get keywords and functions from context
  const { keywords, addKeyword, clearKeywords } = useSeoKeywords();
  const [prompt, setPrompt] = useState<string>("");
  
  // We no longer clear keywords on mount to preserve keywords selected in the SeoKeywordAnalysis page
  // Instead, we'll rely on the context to maintain the selected keywords between pages
  
  // Log keywords for debugging
  React.useEffect(() => {
    logger.debug(`Keywords loaded: ${keywords.length} items`);
  }, [keywords]);
  const [newKeyword, setNewKeyword] = useState<string>("");
  const [result, setResult] = useState<ListingResult>({
    title: "",
    description: "",
    keywords: [],
    altText: ""
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);
  
  // Quota states
  const [quotaInfo, setQuotaInfo] = useState({ used: 0, limit: 5, plan: 'free' });
  const [quotaLoading, setQuotaLoading] = useState(true);

  // Load quota information
  const loadQuotaInfo = useCallback(async () => {
    try {
      setQuotaLoading(true);
      const response = await backendApi.get('create-listing/quota');
      if (response.data && response.data.success) {
        setQuotaInfo({
          used: response.data.used || 0,
          limit: response.data.limit || 5,
          plan: response.data.plan || 'free'
        });
      }
    } catch (error) {
      logger.error('Failed to load quota info', error);
    } finally {
      setQuotaLoading(false);
    }
  }, []);

  // Load quota on component mount
  useEffect(() => {
    loadQuotaInfo();
  }, [loadQuotaInfo]);
  
  // Handle adding a new keyword manually
  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      // Create a new keyword object with default values
      const keyword = {
        id: `manual-${Date.now()}`,
        keyword: newKeyword.trim(),
        popularity: 0,
        competition: 0,
        trend: "stable" as const,
        selected: true
      };
      
      // Add to context
      addKeyword(keyword);
      
      // Clear input field
      setNewKeyword("");
    }
  };


  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a product description");
      return;
    }

    setLoading(true);
    setError(null);
    setQuotaExceeded(false);

    try {
      // Generate all listing components sequentially instead of in parallel
      // 1. Generate title
      const titleResponse = await generateTitle({ 
        productDescription: prompt, 
        targetKeywords: keywords.map(k => k.keyword) 
      });
      await new Promise(r => setTimeout(r, 500)); // Wait 500ms between API calls

      // 2. Generate description
      const descriptionResponse = await generateDescription({ 
        promptInput: prompt, 
        selectedKeywords: keywords.map(k => k.keyword) 
      });
      await new Promise(r => setTimeout(r, 500)); // Wait 500ms between API calls

      // 3. Generate tags
      const tagsResponse = await generateTags(
        prompt,
        keywords.map(k => k.keyword)
      );
      await new Promise(r => setTimeout(r, 500)); // Wait 500ms between API calls

      // 4. Generate alt text
      const altTextResponse = await generateAltText(
        prompt,
        keywords.map(k => k.keyword)
      );

      logger.info('Generated listing components', {
        hasTitle: !!titleResponse?.content,
        hasDescription: !!descriptionResponse?.content,
        hasTags: !!tagsResponse?.content,
        hasAltText: !!altTextResponse?.content
      });

      // Check if all responses have valid content
      if (titleResponse?.content && descriptionResponse?.content && 
          tagsResponse?.content && altTextResponse?.content) {
        
        // If all API calls were successful, increment quota
        try {
          await backendApi.post('increment-quota', { featureKey: 'create-listing' });
          logger.debug('Successfully incremented quota for create-listing');
          // Reload quota info after successful generation
          loadQuotaInfo();
        } catch (quotaError) {
          logger.error('Failed to increment quota', { error: quotaError });
        }
      }
      
      let tags = [];
      try {
        tags = JSON.parse(tagsResponse?.content || "[]");
        logger.debug(`Successfully parsed ${tags.length} tags`);
      } catch (e) {
        logger.error('Failed to parse tags JSON', { content: tagsResponse?.content });
        tags = [];
      }
      const altTexts = altTextResponse?.content || "";
      
      setResult({
        title: titleResponse?.content || "",
        description: descriptionResponse?.content || "",
        keywords: tags,
        altText: altTexts
      });
      
      // Save the generated listing to the database
      try {
        // Process altTexts from string to array based on multiple patterns
        let altTextsArray = [];
        
        // First try to split by Image headers pattern
        if (altTexts.includes('**Image')) {
          altTextsArray = altTexts
            .split(/\*\*Image \d+:\*\*/)
            .filter(text => text.trim().length > 0)
            .map(text => text.trim());
        }
        
        // If that didn't work, try splitting by double line breaks
        if (altTextsArray.length === 0) {
          altTextsArray = altTexts
            .split('\n\n')
            .filter(text => text.trim().length > 0)
            .map(text => text.trim());
        }
        
        // If still empty, just use the whole text as a single item
        const finalAltTextsArray = altTextsArray.length > 0 
          ? altTextsArray 
          : [altTexts.trim()];
        
        logger.debug(`Processed ${finalAltTextsArray.length} alt text entries`);
        
        await createListing({
          title: titleResponse?.content || "",
          description: descriptionResponse?.content || "",
          tags,
          altTexts: finalAltTextsArray,
          originalPrompt: prompt
        });
        logger.info('Listing saved successfully to database');
      } catch (err) {
        logger.error('Failed to save listing to database', { error: err.message });
      }
    } catch (err) {
      logger.error('Error generating listing', { error: err.message || err });
      
      // Check for 403 Quota Exceeded error
      if (err.response && err.response.status === 403) {
        // Extract quota information from the response if available
        const quotaData = err.response.data?.quota || {};
        const feature = quotaData.feature || 'create-listing';
        const limit = quotaData.limit || 5;
        const plan = quotaData.plan || 'free';
        
        const errorMessage = `You have reached your daily limit of ${limit} listing creations for your ${plan} plan. Your quota will reset tomorrow or you can upgrade to a premium plan for higher limits.`;
        
        setQuotaExceeded(true);
        setError(errorMessage);
        
        toast({
          title: "Quota Exceeded",
          description: errorMessage,
          variant: "destructive"
        });
      } else {
        setError("Failed to generate listing. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayoutFixed>
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <div className="flex flex-col space-y-8 pb-8">
          {/* Page Header */}
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-1 bg-gradient-to-b from-primary to-primary/40 rounded-full"></div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">Create Etsy Listing</h1>
                </div>
                <p className="text-muted-foreground pl-4 border-l-2 border-muted/30 dark:border-muted/10">
                  Generate optimized Etsy listings using your product description and selected keywords.
                </p>
              </div>
              
              {quotaInfo && (
                <Card className="w-64 border-muted/40 dark:border-muted/20 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Daily Usage</span>
                      <Badge variant="outline" className="text-xs">
                        {quotaLoading ? '...' : quotaInfo.plan.charAt(0).toUpperCase() + quotaInfo.plan.slice(1)}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Progress 
                        value={quotaLoading ? 0 : (quotaInfo.used / quotaInfo.limit) * 100} 
                        className="h-2" 
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {quotaLoading ? '...' : `${quotaInfo.used}/${quotaInfo.limit} used`}
                        </span>
                        <span>
                          {quotaLoading ? '...' : `${quotaInfo.limit - quotaInfo.used} remaining`}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Input Form */}
          <Card className="w-full border-muted/40 dark:border-muted/20 shadow-sm overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-primary to-primary/60 dark:from-primary dark:to-primary/40 rounded-t-sm"></div>
            <CardHeader className="bg-muted/10 dark:bg-muted/5 pb-3">
              <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Listing Details</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter your product description and we'll generate an optimized listing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {quotaExceeded && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <AlertTitle>Quota Exceeded</AlertTitle>
                  <AlertDescription>
                    Your daily listing quota has been used (5/5). Please upgrade to continue.
                  </AlertDescription>
                </Alert>
              )}
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-6">
                <div>
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium text-foreground">Product Description</h3>
                      <SamplePromptList onPromptSelect={setPrompt} />
                    </div>
                    <PromptInput prompt={prompt} setPrompt={setPrompt} />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-foreground mb-2">Selected Keywords:</h3>
                  
                  {/* Keyword input */}
                  <div className="flex items-center space-x-2 mb-4">
                    <Input
                      placeholder="Add a keyword manually"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddKeyword();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleAddKeyword} 
                      type="button" 
                      size="sm"
                      variant="default"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  
                  <KeywordSelector />
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <Button 
                    onClick={handleGenerate} 
                    className="w-full md:w-auto shadow-sm hover:shadow-md transition-all"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Listing
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Section - Only show if we have results */}
          {(result.title || result.description || result.keywords.length > 0 || result.altText) && (
            <Card className="w-full border-muted/40 dark:border-muted/20 mt-8 shadow-sm overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-primary to-primary/60 dark:from-primary dark:to-primary/40 rounded-t-sm"></div>
              <CardHeader className="bg-muted/10 dark:bg-muted/5 pb-3">
                <CardTitle className="text-xl font-semibold text-foreground">Generated Listing</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Your optimized Etsy listing is ready to use.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GeneratedListingOutput 
                  title={result.title}
                  description={result.description}
                  keywords={result.keywords}
                  altText={result.altText}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayoutFixed>
  );
};

export default CreateListing;
