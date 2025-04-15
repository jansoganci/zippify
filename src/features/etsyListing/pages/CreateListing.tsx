import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useSeoKeywords } from "../context/KeywordContext";
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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface ListingResult {
  title: string;
  description: string;
  keywords: string[];
  altText: string;
}

const CreateListing: React.FC = () => {
  // Get keywords and functions from context
  const { keywords, addKeyword } = useSeoKeywords();
  const [prompt, setPrompt] = useState<string>("");
  
  // Debug log to verify keywords are loaded correctly
  React.useEffect(() => {
    console.log('[DEBUG] Keywords in CreateListing:', keywords);
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
  
  // Debug log to verify full Keyword objects
  console.log("[DEBUG] Keywords in CreateListing:", keywords);
  
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
      const descriptionResponse = await generateDescription({ promptInput: prompt });
      await new Promise(r => setTimeout(r, 500)); // Wait 500ms between API calls

      // 3. Generate tags
      const tagsResponse = await generateTags(prompt);
      await new Promise(r => setTimeout(r, 500)); // Wait 500ms between API calls

      // 4. Generate alt text
      const altTextResponse = await generateAltText(prompt);

      console.log("🟡 Tags result:", tagsResponse?.content);
      console.log("🟠 Alt Texts result:", altTextResponse?.content);

      // Check if all responses have valid content
      if (titleResponse?.content && descriptionResponse?.content && 
          tagsResponse?.content && altTextResponse?.content) {
        
        // If all API calls were successful, increment quota
        try {
          await backendApi.post('/api/increment-quota', { featureKey: 'create-listing' });
          console.log('Successfully incremented quota for create-listing');
        } catch (quotaError) {
          // Log error but don't show to user
          console.error('Failed to increment quota:', quotaError);
        }
      }
      
      let tags = [];
      try {
        tags = JSON.parse(tagsResponse?.content || "[]");
        console.log("✅ Tags parsed successfully:", tags);
      } catch (e) {
        console.error("❌ Failed to parse tags JSON:", tagsResponse?.content);
        tags = [];
      }
      const altTexts = altTextResponse?.content || "";
      
      console.log("🟡 Tags array after processing:", tags);
      console.log("🟠 Alt Texts after processing:", altTexts);
      
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
        
        console.log("🟢 Processed altTexts array:", finalAltTextsArray);
        console.log("🟢 Final altTexts array:", finalAltTextsArray);
        
        await createListing({
          title: titleResponse?.content || "",
          description: descriptionResponse?.content || "",
          tags,
          altTexts: finalAltTextsArray,
          originalPrompt: prompt
        });
        console.log("✅ [CreateListing] Listing saved successfully to DB");
      } catch (err) {
        console.error("❌ [CreateListing] Failed to save listing to DB:", err.message);
      }
    } catch (err) {
      console.error("Error generating listing:", err);
      
      // Check for 403 Quota Exceeded error
      if (err.response && err.response.status === 403) {
        setQuotaExceeded(true);
        toast({
          title: "Quota Exceeded",
          description: "You've reached your daily limit of 5 listings.",
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
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <div className="flex flex-col space-y-8">
          {/* Page Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Create Etsy Listing</h1>
            <p className="text-muted-foreground">
              Generate optimized Etsy listings using your product description and selected keywords.
            </p>
          </div>

          {/* Input Form */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Listing Details</CardTitle>
              <CardDescription>
                Enter your product description and we'll generate an optimized listing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {quotaExceeded && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <span className="font-medium">Your daily listing quota has been used (5/5). Please upgrade to continue.</span>
                  </div>
                </div>
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
                      <h3 className="text-sm font-medium text-gray-700">Product Description</h3>
                      <SamplePromptList onPromptSelect={setPrompt} />
                    </div>
                    <PromptInput prompt={prompt} setPrompt={setPrompt} />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Keywords:</h3>
                  <KeywordSelector />
                  
                  {/* Manual keyword input */}
                  <div className="flex items-center space-x-2 mt-4">
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
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <Button 
                    onClick={handleGenerate} 
                    className="w-full md:w-auto"
                    disabled={loading}
                  >
                    {loading ? "Generating..." : "Generate Listing"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Section - Only show if we have results */}
          {(result.title || result.description || result.keywords.length > 0 || result.altText) && (
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Generated Listing</CardTitle>
                <CardDescription>
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
    </DashboardLayout>
  );
};

export default CreateListing;
