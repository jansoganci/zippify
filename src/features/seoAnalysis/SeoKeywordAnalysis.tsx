
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSeoKeywords } from "@/features/etsyListing/context/KeywordContext";
import { useForm } from "react-hook-form";
import DashboardLayout from "@/components/DashboardLayout";
import { backendApi } from "@/services/workflow/apiClient";
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ArrowUpDown, 
  Check, 
  ChevronDown,
  AlertCircle,
  FileText,
  BarChart
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";

interface FormValues {
  productName: string;
  category: string;
  country: string;
  platform: string;
}

interface Keyword {
  id: string;
  keyword: string;
  popularity: number;
  competition: number;
  trend: "increasing" | "stable" | "declining";
  selected: boolean;
}

const SeoKeywordAnalysis = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<Keyword[]>([]);
  const [sortBy, setSortBy] = useState<string>("popularity");
  const [showSelected, setShowSelected] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [noKeywordsFound, setNoKeywordsFound] = useState(false);
  const [isPlaceholder, setIsPlaceholder] = useState(false);
  
  // Access the keyword context for transferring selected keywords to the CreateListing page
  const { setKeywords: setContextKeywords } = useSeoKeywords();

  // Check for auth token on component mount (for debugging purposes)
  useEffect(() => {
    const token = localStorage.getItem('zippify_token');
    if (!token) {
      console.warn('⚠️ Authentication Warning: No zippify_token found in localStorage. API requests may fail with 401 Unauthorized.');
    } else {
      console.log('✅ Auth token found in localStorage');
    }
  }, []);


  const form = useForm<FormValues>({
    defaultValues: {
      productName: "",
      category: "",
      country: "US",
      platform: "Etsy",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setError(null);
    setNoKeywordsFound(false);
    
    try {
      // Construct query parameters
      const queryParams = new URLSearchParams({
        product_name: data.productName,
        category: data.category || '',
        country: data.country || 'US',
        platform: data.platform || 'Etsy'
      });
      
      // Make API request using backendApi (JWT token will be added by interceptor)
      // API rotaları /api ile başlıyor, bu nedenle /api/keywords olmalı
      // Endpoint'i oluştur
      let endpoint = `/api/keywords?${queryParams.toString()}`;
      
      // Canlı sistemde URL'yi kontrol et ve gerekirse düzelt
      if (import.meta.env.PROD) {
        console.log('🔧 Production environment detected, using /api prefix');
      }
      
      const response = await backendApi.get(endpoint);
      
      // Axios wraps the response differently than fetch
      if (response.status !== 200) {
        // Handle unauthorized responses specifically
        if (response.status === 401) {
          console.warn("Unauthorized: Displaying login error message.");
          setError("Your session has expired or you're not logged in. Please log in again.");
          return;
        }
        // Handle quota exceeded responses
        if (response.status === 403) {
          console.warn("Quota exceeded: Displaying limit message.");
          
          // Extract quota information from the response if available
          const quotaData = response.data?.quota || {};
          const feature = quotaData.feature || 'seo-analysis';
          const limit = quotaData.limit || 5;
          const plan = quotaData.plan || 'free';
          
          const errorMessage = `You have reached your daily limit of ${limit} SEO keyword searches for your ${plan} plan. Your quota will reset tomorrow or you can upgrade to a premium plan for higher limits.`;
          
          toast({
            title: "Quota Exceeded",
            description: errorMessage,
            variant: "destructive"
          });
          
          setError(errorMessage);
          return;
        }
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      // With axios, response.data is already parsed JSON
      const responseData = response.data;
      console.log('API Response:', responseData); // Log full response for debugging
      
      // Extract keywords from the response
      if (import.meta.env.MODE !== 'production') {
        console.log('API response:', responseData);
      }
      
      // Daha detaylı API yanıtı incelemesi
      if (!responseData || !responseData.data) {
        if (import.meta.env.MODE !== 'production') {
          console.error('API response missing data object:', responseData);
        }
        setNoKeywordsFound(true);
        setError("No keywords found for this input. Try changing your filters or using more general terms.");
        setKeywords([]);
        return;
      }
      
      if (!responseData.data.keywords || !Array.isArray(responseData.data.keywords)) {
        if (import.meta.env.MODE !== 'production') {
          console.error('API response missing keywords array:', responseData.data);
        }
        setNoKeywordsFound(true);
        setError("No keywords found for this input. Try changing your filters or using more general terms.");
        setKeywords([]);
        return;
      }
      
      if (responseData.data.keywords.length === 0) {
        if (import.meta.env.MODE !== 'production') {
          console.error('API returned empty keywords array:', responseData.data);
        }
        setNoKeywordsFound(true);
        setError("No keywords found for this input. Try changing your filters or using more general terms.");
        setKeywords([]);
        return;
      }
      
      // Keywords bulundu, işlemeye devam et
      // Add unique IDs to each keyword if they don't have one
      const keywordsWithIds = responseData.data.keywords.map((keyword, index) => {
        // If keyword already has an id, use it; otherwise generate one
        if (!keyword.id) {
          return {
            ...keyword,
            id: `kw-${Date.now()}-${index}`,
            selected: false
          };
        }
        return keyword;
      });
      
      console.log('Keywords with IDs:', keywordsWithIds);
      setKeywords(keywordsWithIds);
      setNoKeywordsFound(false);
      setIsPlaceholder(responseData.data.error === true);
    } catch (error: any) {
      // Log detailed error with stack trace
      console.error('Error fetching keyword data:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      
      // Set error state for UI display
      if (error.response?.status === 403) {
        setError("Your daily quota of 5 SEO analyses has been used.");
      } else {
        setError("Something went wrong while fetching keywords.");
      }
      setKeywords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleKeyword = useCallback((keywordId: string, isSelected?: boolean) => {
    // Validate keywordId
    if (!keywordId) {
      console.error('Invalid keywordId: undefined or empty');
      return;
    }
    
    // Log for debugging
    console.log(`Toggle request for keyword ID: ${keywordId}, set to: ${isSelected}`);
    
    // Find the target keyword by ID
    const targetKeyword = keywords.find(k => k.id === keywordId);
    if (!targetKeyword) {
      console.warn(`Keyword with ID ${keywordId} not found`);
      return;
    }

    // Determine the new state - use the provided value or toggle the current one
    const newSelectedState = isSelected !== undefined ? isSelected : !targetKeyword.selected;
    
    // Skip if no change
    if (targetKeyword.selected === newSelectedState) {
      console.log(`No change needed for ${targetKeyword.keyword}, already ${newSelectedState ? 'selected' : 'unselected'}`);
      return;
    }

    console.log(`Setting keyword "${targetKeyword.keyword}" (${keywordId}) to ${newSelectedState ? 'selected' : 'unselected'}`);
    
    // Create a new keywords array with the updated selection state
    const updatedKeywords = keywords.map(k => {
      if (k.id === keywordId) {
        return { ...k, selected: newSelectedState };
      }
      return k;
    });

    // Update both state variables
    setKeywords(updatedKeywords);
    setSelectedKeywords(updatedKeywords.filter(k => k.selected));
  }, [keywords]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="text-green-500" />;
      case "declining":
        return <TrendingDown className="text-red-500" />;
      default:
        return <Minus className="text-gray-500" />;
    }
  };

  const getCompetitionClass = (competition: number) => {
    if (competition >= 0.6) {
      return "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs";
    } else if (competition >= 0.3) {
      return "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs";
    } else {
      return "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs";
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="flex flex-col space-y-8">
        {/* Page Header */}
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-1 bg-gradient-to-b from-primary to-primary/40 rounded-full"></div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">SEO & Keyword Analysis</h1>
          </div>
          <p className="text-muted-foreground pl-4 border-l-2 border-muted/30 dark:border-muted/10">
            Analyze keywords for your product listings and optimize for search engines.
          </p>
        </div>

        {/* Analysis Form */}
        <Card className="w-full border-muted/40 dark:border-muted/20 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-primary to-primary/60 dark:from-primary dark:to-primary/40 rounded-t-sm"></div>
          <CardHeader className="bg-muted/10 dark:bg-muted/5 pb-3">
            <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <BarChart className="h-5 w-5 text-primary" />
              <span>Analysis Parameters</span>
            </CardTitle>
            <CardDescription>
              Enter your product details to get keyword suggestions.
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
            
            {noKeywordsFound && !error && (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Keywords Found</AlertTitle>
                <AlertDescription>
                  No keywords found for this input. Try changing your filters or using more general terms.
                </AlertDescription>
              </Alert>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="productName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name*</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="E.g., Handmade Ceramic Mug" 
                            {...field} 
                            required
                            className="border-input/60 focus-visible:ring-primary/20 bg-background"
                          />
                        </FormControl>
                        <FormDescription>
                          Enter the main product name or type
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="E.g., Home & Living" 
                            {...field}
                            className="border-input/60 focus-visible:ring-primary/20 bg-background dark:bg-background-dark dark:border-input-dark/60 dark:focus-visible:ring-primary-dark/20"
                          />
                        </FormControl>
                        <FormDescription>
                          Specify a category to improve results
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Country</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="US, UK, CA, etc." 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Enter country code (default: US)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Etsy, Amazon, eBay, etc." 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Platform to optimize for (default: Etsy)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full md:w-auto"
                  disabled={loading}
                >
                  {loading ? (
                    <>Running Analysis...</>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Run Keyword Analysis
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Results Section - Only show if we have results */}
        {keywords.length > 0 && (
          <Card className="w-full border-muted/40 dark:border-muted/20 shadow-sm overflow-hidden">
            {isPlaceholder && (
              <div className="mb-4 rounded-md border-l-4 border-yellow-500 bg-yellow-50 p-3 text-sm text-yellow-800">
                Google Trends verisi şu anda erişilemedi; tahmini (placeholder) değerler gösteriliyor.
              </div>
            )}
            <div className="h-1.5 bg-gradient-to-r from-primary to-primary/60 dark:from-primary dark:to-primary/40 rounded-t-sm"></div>
            <CardHeader className="bg-muted/10 dark:bg-muted/5 pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Keyword Suggestions</CardTitle>
                  <CardDescription>
                    {keywords.length} keywords found based on your search.
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <ToggleGroup type="single" defaultValue="popularity">
                    <ToggleGroupItem 
                      value="popularity" 
                      onClick={() => setSortBy("popularity")}
                    >
                      Popularity
                    </ToggleGroupItem>
                    <ToggleGroupItem 
                      value="competition" 
                      onClick={() => setSortBy("competition")}
                    >
                      Competition
                    </ToggleGroupItem>
                    <ToggleGroupItem 
                      value="trend" 
                      onClick={() => setSortBy("trend")}
                    >
                      Trend
                    </ToggleGroupItem>
                  </ToggleGroup>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowSelected(!showSelected)}
                  >
                    {showSelected ? "Show All" : "Show Selected"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Keyword</TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center">
                          Popularity
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="text-center">Competition</TableHead>
                      <TableHead className="text-center">Trend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(showSelected ? keywords.filter(k => k.selected) : keywords).map((keyword, index) => (
                      <TableRow key={`keyword-row-${keyword.id || index}`}>
                        <TableCell>
                          <input
                            type="checkbox"
                            id={`checkbox-${keyword.id}`}
                            checked={keyword.selected || false}
                            onChange={(e) => {
                              // Stop event propagation
                              e.stopPropagation();
                              // Get the checked state directly from the event
                              const isChecked = e.target.checked;
                              // Ensure we have a valid ID
                              if (!keyword.id) {
                                console.error('Missing keyword ID in checkbox change handler');
                                return;
                              }
                              // Call the toggle handler with the keyword ID and new state
                              handleToggleKeyword(keyword.id, isChecked);
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{keyword.keyword}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <div className="w-full max-w-[100px] bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-primary h-2.5 rounded-full" 
                                style={{ width: `${keyword.popularity}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-xs">{keyword.popularity}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={getCompetitionClass(keyword.competition)} title={`Competition score: ${keyword.competition.toFixed(2)}`}>
                            {keyword.competition >= 0.6 ? "High" : keyword.competition >= 0.3 ? "Medium" : "Low"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            {getTrendIcon(keyword.trend)}
                            <span className="ml-2 text-xs capitalize">{keyword.trend}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">2</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">3</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                Data sourced from Google Trends and marketplace analytics.
              </p>
              <Button 
                variant="secondary"
                onClick={() => {
                  // Check if selectedKeywords is empty
                  if (selectedKeywords.length === 0) {
                    console.warn("[WARNING] No keywords selected for transfer to CreateListing");
                    return;
                  }
                  
                  // Log selectedKeywords before context update
                  console.log("[DEBUG] selectedKeywords before setContextKeywords:", selectedKeywords);
                  console.log("[DEBUG] sending to context:", JSON.stringify(selectedKeywords));
                  
                  // First clear any existing keywords, then set the selected keywords
                  setContextKeywords([]);
                  setTimeout(() => {
                    // Pass the full keyword objects to preserve all metadata
                    setContextKeywords(selectedKeywords);
                    
                    // Try to verify context was updated
                    console.log("[DEBUG] Context update triggered with", selectedKeywords.length, "keywords");
                    
                    // Navigate to create page
                    navigate("/create");
                  }, 0);
                }}
                disabled={!selectedKeywords.length}
              >
                Use for Listing ({selectedKeywords.length})
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Selected Keywords Section - Static Display */}
        {selectedKeywords.length > 0 && (
          <Card className="w-full border-muted/40 dark:border-muted/20 shadow-sm overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-primary to-primary/60 dark:from-primary dark:to-primary/40 rounded-t-sm"></div>
            <CardHeader className="bg-muted/10 dark:bg-muted/5 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Selected Keywords ({selectedKeywords.length})</CardTitle>
                {selectedKeywords.length > 0 && (
                  <Button 
                    size="sm"
                    variant="secondary"
                    className="transition-all hover:bg-secondary/80"
                    onClick={() => {
                      try {
                        // Log for debugging
                        console.log('Transferring keywords to Create Listing page:', selectedKeywords);
                        
                        // First clear any existing keywords to prevent state conflicts
                        setContextKeywords([]);
                        
                        // Small delay to ensure clearing completes
                        setTimeout(() => {
                          // Set the selected keywords in the context
                          // This will automatically update localStorage via the context's setKeywordsWithStorage
                          setContextKeywords(selectedKeywords);
                          
                          // Navigate to create listing page after keywords are set
                          navigate("/create");
                        }, 50);
                      } catch (error) {
                        console.error('Error transferring keywords:', error);
                        // Navigate anyway
                        navigate("/create");
                      }
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Use Selected Keywords
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedKeywords.map((keyword, index) => (
                  <div 
                    key={`selected-keyword-${keyword.id || index}`}
                    className="flex items-center gap-2 bg-secondary/90 dark:bg-secondary/80 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{keyword.keyword}</span>
                    <button 
                      onClick={() => handleToggleKeyword(keyword.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </DashboardLayout>
  );
};

export default SeoKeywordAnalysis;