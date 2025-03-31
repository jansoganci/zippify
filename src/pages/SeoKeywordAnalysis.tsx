
import { useState, useEffect } from "react";
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
  AlertCircle
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
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<Keyword[]>([]);
  const [sortBy, setSortBy] = useState<string>("popularity");
  const [showSelected, setShowSelected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noKeywordsFound, setNoKeywordsFound] = useState(false);

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
      const response = await backendApi.get(`/api/keywords?${queryParams.toString()}`);
      
      // Axios wraps the response differently than fetch
      if (response.status !== 200) {
        // Handle unauthorized responses specifically
        if (response.status === 401) {
          console.warn("Unauthorized: Displaying login error message.");
          setError("Your session has expired or you're not logged in. Please log in again.");
          return;
        }
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      // With axios, response.data is already parsed JSON
      const responseData = response.data;
      console.log('API Response:', responseData); // Log full response for debugging
      
      // Extract keywords from the response
      if (responseData && responseData.data && responseData.data.keywords && responseData.data.keywords.length > 0) {
        setKeywords(responseData.data.keywords);
        setNoKeywordsFound(false);
      } else {
        // Log detailed error for debugging
        console.error('Invalid API response format or no keywords returned:', {
          responseReceived: responseData,
          hasData: Boolean(responseData?.data),
          hasKeywords: Boolean(responseData?.data?.keywords),
          keywordsLength: responseData?.data?.keywords?.length || 0,
          timestamp: new Date().toISOString()
        });
        
        // Set state to show no keywords found message
        setNoKeywordsFound(true);
        setKeywords([]);
      }
    } catch (error: any) {
      // Log detailed error with stack trace
      console.error('Error fetching keyword data:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      
      // Set error state for UI display
      setError("Something went wrong while fetching keywords.");
      setKeywords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleKeyword = (keywordId: string) => {
    setKeywords(keywords.map(keyword => 
      keyword.id === keywordId 
        ? { ...keyword, selected: !keyword.selected } 
        : keyword
    ));
    
    // Update selected keywords list
    const updatedKeywords = keywords.map(k => k.id === keywordId ? {...k, selected: !k.selected} : k);
    setSelectedKeywords(updatedKeywords.filter(k => k.selected));
  };

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
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">SEO & Keyword Analysis</h1>
          <p className="text-muted-foreground">
            Analyze keywords for your product listings and optimize for search engines.
          </p>
        </div>

        {/* Analysis Form */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Analysis Parameters</CardTitle>
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
          <Card className="w-full">
            <CardHeader>
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
                    {(showSelected ? keywords.filter(k => k.selected) : keywords).map((keyword) => (
                      <TableRow key={keyword.id}>
                        <TableCell>
                          <Checkbox
                            checked={keyword.selected}
                            onCheckedChange={() => handleToggleKeyword(keyword.id)}
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
                onClick={() => console.log("Export selected keywords")}
                disabled={!selectedKeywords.length}
              >
                Export Selected ({selectedKeywords.length})
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Selected Keywords Collapsible */}
        {selectedKeywords.length > 0 && (
          <Collapsible className="w-full border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Selected Keywords ({selectedKeywords.length})</h3>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ChevronDown className="h-4 w-4" />
                  <span className="sr-only">Toggle</span>
                </Button>
              </CollapsibleTrigger>
            </div>
            
            <CollapsibleContent className="mt-4">
              <div className="flex flex-wrap gap-2">
                {selectedKeywords.map((keyword) => (
                  <div 
                    key={keyword.id}
                    className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-full text-sm"
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
              <div className="mt-4 text-right">
                <Button 
                  size="sm"
                  onClick={() => console.log("Copy to clipboard")}
                >
                  Copy All
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
    </DashboardLayout>
  );
};

export default SeoKeywordAnalysis;