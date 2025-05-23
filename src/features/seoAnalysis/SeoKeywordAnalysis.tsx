import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSeoKeywords } from "@/features/etsyListing/context/KeywordContext";
import { useForm } from "react-hook-form";
import DashboardLayoutFixed from "@/components/DashboardLayoutFixed";
import { backendApi } from "@/services/workflow/apiClient";
import { createLogger } from "@/utils/logger";
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

// Create component-specific logger
const logger = createLogger('SeoKeywordAnalysis');

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

  // Check for auth token on component mount
  useEffect(() => {
    const token = localStorage.getItem('zippify_token');
    if (!token) {
      logger.warn('No authentication token found - API requests may fail');
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
      
      const endpoint = `keywords?${queryParams.toString()}`;
      logger.info('Requesting keyword analysis', { productName: data.productName, category: data.category });
      
      const response = await backendApi.get(endpoint);
      
      // Handle error responses
      if (response.status !== 200) {
        if (response.status === 401) {
          logger.warn('Authentication failed - redirecting to login');
          setError("Your session has expired or you're not logged in. Please log in again.");
          return;
        }
        
        if (response.status === 403) {
          logger.warn('Quota exceeded for SEO analysis');
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
      
      // Process response data
      const responseData = response.data;
      
      // Validate response structure
      if (!responseData || !responseData.data) {
        logger.error('Invalid API response structure', { responseData });
        setNoKeywordsFound(true);
        setError("No keywords found for this input. Try changing your filters or using more general terms.");
        setKeywords([]);
        return;
      }
      
      if (!responseData.data.keywords || !Array.isArray(responseData.data.keywords)) {
        logger.error('Missing or invalid keywords array in response');
        setNoKeywordsFound(true);
        setError("No keywords found for this input. Try changing your filters or using more general terms.");
        setKeywords([]);
        return;
      }
      
      if (responseData.data.keywords.length === 0) {
        logger.info('No keywords returned from API');
        setNoKeywordsFound(true);
        setError("No keywords found for this input. Try changing your filters or using more general terms.");
        setKeywords([]);
        return;
      }
      
      // Process keywords with IDs
      const keywordsWithIds = responseData.data.keywords.map((keyword, index) => {
        if (!keyword.id) {
          return {
            ...keyword,
            id: `kw-${Date.now()}-${index}`,
            selected: false
          };
        }
        return keyword;
      });
      
      logger.info(`Successfully processed ${keywordsWithIds.length} keywords`);
      setKeywords(keywordsWithIds);
      setNoKeywordsFound(false);
      setIsPlaceholder(responseData.data.error === true);
    } catch (error: any) {
      logger.error('Failed to fetch keyword data', { 
        message: error.message,
        status: error.response?.status 
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
      logger.error('Invalid keywordId provided to toggle handler');
      return;
    }
    
    // Find the target keyword by ID
    const targetKeyword = keywords.find(k => k.id === keywordId);
    if (!targetKeyword) {
      logger.warn(`Keyword with ID ${keywordId} not found`);
      return;
    }

    // Determine the new state
    const newSelectedState = isSelected !== undefined ? isSelected : !targetKeyword.selected;
    
    // Skip if no change needed
    if (targetKeyword.selected === newSelectedState) {
      return;
    }

    logger.debug(`Toggling keyword "${targetKeyword.keyword}" to ${newSelectedState ? 'selected' : 'unselected'}`);
    
    // Update keywords with new selection state
    const updatedKeywords = keywords.map(k => {
      if (k.id === keywordId) {
        return { ...k, selected: newSelectedState };
      }
      return k;
    });

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

  const handleKeywordTransfer = async (keywords: Keyword[]) => {
    if (keywords.length === 0) {
      logger.warn('No keywords selected for transfer');
      return;
    }
    
    try {
      logger.info(`Transferring ${keywords.length} keywords to CreateListing page`);
      
      // Clear existing keywords first
      setContextKeywords([]);
      
      // Small delay to ensure clearing completes
      setTimeout(() => {
        setContextKeywords(keywords);
        navigate("/create");
      }, 50);
    } catch (error) {
      logger.error('Failed to transfer keywords', { error });
      // Navigate anyway
      navigate("/create");
    }
  };

  return (
    <DashboardLayoutFixed>
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
                            placeholder="Etsy, eBay, Amazon, etc." 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Target marketplace (default: Etsy)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto"
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing Keywords...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Analyze Keywords
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Keywords Results */}
        {keywords.length > 0 && (
          <Card className="w-full border-muted/40 dark:border-muted/20 shadow-sm overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-primary to-primary/60 dark:from-primary dark:to-primary/40 rounded-t-sm"></div>
            <CardHeader className="bg-muted/10 dark:bg-muted/5 pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    Keyword Results ({keywords.length})
                  </CardTitle>
                  <CardDescription>
                    {isPlaceholder && "Note: These are sample keywords for demonstration."}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <ToggleGroup type="single" value={showSelected ? "selected" : "all"} onValueChange={(value) => setShowSelected(value === "selected")}>
                    <ToggleGroupItem value="all" aria-label="Show all keywords">
                      All ({keywords.length})
                    </ToggleGroupItem>
                    <ToggleGroupItem value="selected" aria-label="Show selected keywords">
                      Selected ({selectedKeywords.length})
                    </ToggleGroupItem>
                  </ToggleGroup>
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
                              e.stopPropagation();
                              const isChecked = e.target.checked;
                              if (!keyword.id) {
                                logger.error('Missing keyword ID in checkbox handler');
                                return;
                              }
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
                onClick={() => handleKeywordTransfer(selectedKeywords)}
                disabled={!selectedKeywords.length}
              >
                Use for Listing ({selectedKeywords.length})
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Selected Keywords Section */}
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
                    onClick={() => handleKeywordTransfer(selectedKeywords)}
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
    </DashboardLayoutFixed>
  );
};

export default SeoKeywordAnalysis;