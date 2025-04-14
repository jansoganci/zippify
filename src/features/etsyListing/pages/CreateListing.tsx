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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface ListingResult {
  title: string;
  description: string;
  keywords: string[];
  altText: string;
}

const CreateListing: React.FC = () => {
  const { keywords } = useSeoKeywords();
  const [prompt, setPrompt] = useState<string>("");
  const [result, setResult] = useState<ListingResult>({
    title: "",
    description: "",
    keywords: [],
    altText: ""
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a product description");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Generate all listing components in parallel
      const [titleResponse, descriptionResponse, tagsResponse, altTextResponse] = await Promise.all([
        generateTitle({ productDescription: prompt, targetKeywords: keywords }),
        generateDescription({ promptInput: prompt }),
        generateTags(prompt),
        generateAltText(prompt)
      ]);
      
      setResult({
        title: titleResponse?.content || "",
        description: descriptionResponse?.content || "",
        keywords: tagsResponse?.content?.split(",") || [],
        altText: altTextResponse?.content || ""
      });
    } catch (err) {
      console.error("Error generating listing:", err);
      
      // Check for 403 Quota Exceeded error
      if (err.response && err.response.status === 403) {
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
