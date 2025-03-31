import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Minus, Plus } from "lucide-react";

interface FormValues {
  productName: string;
  category: string;
  country: string;
  platform: string;
}

interface KeywordResult {
  keyword: string;
  competition: number;
  popularity: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

const SeoKeywordAnalysis = () => {
  // Form state management
  const [formData, setFormData] = useState<FormValues>({
    productName: '',
    category: '',
    country: 'US',
    platform: 'Etsy'
  });
  
  // State for keyword results
  const [keywordResults, setKeywordResults] = useState<KeywordResult[]>([]);
  
  // State for selected keywords
  const [selectedKeywords, setSelectedKeywords] = useState<KeywordResult[]>([]);
  
  // Store selected keywords in localStorage whenever the list changes
  useEffect(() => {
    if (selectedKeywords.length > 0) {
      localStorage.setItem("zippify_selected_keywords", JSON.stringify(selectedKeywords));
      console.log("Selected keywords stored in localStorage:", selectedKeywords);
    }
  }, [selectedKeywords]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.productName) {
      alert('Product Name is required');
      return;
    }
    
    if (!formData.country) {
      alert('Target Country is required');
      return;
    }
    
    // Construct query parameters
    const queryParams = new URLSearchParams({
      product_name: formData.productName,
      country: formData.country,
      platform: formData.platform
    });
    
    // Add optional category if provided
    if (formData.category) {
      queryParams.append('category', formData.category);
    }
    
    // Make API request
    try {
      const response = await fetch(`/api/keywords?${queryParams.toString()}`);
      const data = await response.json();
      
      // Log response to console
      console.log('Keyword analysis response:', data);
      
      // Update state with keyword results
      if (data && data.keywords) {
        setKeywordResults(data.keywords);
      }
    } catch (error) {
      console.error('Error fetching keyword data:', error);
    }
  };
  
  // Helper function to render trend icon
  const renderTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable':
      default:
        return <Minus className="h-4 w-4 text-blue-500" />;
    }
  };
  
  // Function to add a keyword to selected list
  const addKeyword = (keyword: KeywordResult) => {
    // Check if keyword is already in the selected list
    const isAlreadySelected = selectedKeywords.some(
      selected => selected.keyword === keyword.keyword
    );
    
    // If not already selected, add it to the list
    if (!isAlreadySelected) {
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
  };
  
  // Function to remove a keyword from selected list
  const removeKeyword = (keywordToRemove: KeywordResult) => {
    setSelectedKeywords(
      selectedKeywords.filter(keyword => keyword.keyword !== keywordToRemove.keyword)
    );
  };

  return (
    <DashboardLayout>
      <div className="py-10 px-4 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">SEO & Keyword Analysis</h1>
          <p className="text-muted-foreground">Analyze keywords to optimize your product listings</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Keyword Research</CardTitle>
            <CardDescription>
              Enter your product details to discover relevant keywords and SEO opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input 
                    id="productName" 
                    placeholder="e.g. Wooden Cutting Board" 
                    className="w-full" 
                    value={formData.productName}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category (Optional)</Label>
                  <Input 
                    id="category" 
                    placeholder="e.g. Kitchen, Home Decor" 
                    className="w-full" 
                    value={formData.category}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">Target Country</Label>
                  <select 
                    id="country" 
                    className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                    value={formData.country}
                    onChange={handleInputChange}
                  >
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="DE">Germany</option>
                    <option value="TR">Turkey</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="platform">Sales Platform</Label>
                  <select 
                    id="platform" 
                    className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                    value={formData.platform}
                    onChange={handleInputChange}
                  >
                    <option value="Etsy">Etsy</option>
                    <option value="Amazon">Amazon</option>
                    <option value="Shopify">Shopify</option>
                    <option value="eBay">eBay</option>
                    <option value="WooCommerce">WooCommerce</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-center pt-4">
                <Button 
                  type="submit" 
                  className="px-6"
                >
                  Run Keyword Analysis
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {keywordResults.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Keyword Analysis Results</CardTitle>
              <CardDescription>
                Based on your search for "{formData.productName}"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Keyword</TableHead>
                    <TableHead className="w-[120px]">Popularity</TableHead>
                    <TableHead className="w-[120px]">Competition</TableHead>
                    <TableHead className="w-[100px]">Trend</TableHead>
                    <TableHead className="w-[80px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keywordResults.map((keyword, index) => (
                    <TableRow key={`${keyword.keyword}-${index}`}>
                      <TableCell className="font-medium">{keyword.keyword}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="bg-gray-200 dark:bg-gray-700 w-full h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-green-500 h-full rounded-full" 
                              style={{ width: `${keyword.popularity}%` }}
                            />
                          </div>
                          <span className="text-xs">{keyword.popularity}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="bg-gray-200 dark:bg-gray-700 w-full h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-amber-500 h-full rounded-full" 
                              style={{ width: `${keyword.competition * 100}%` }}
                            />
                          </div>
                          <span className="text-xs">{(keyword.competition * 100).toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {renderTrendIcon(keyword.trend)}
                          <span className="ml-1 text-sm">
                            {keyword.trend.charAt(0).toUpperCase() + keyword.trend.slice(1)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => addKeyword(keyword)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
        
        {/* Selected Keywords Section */}
        {selectedKeywords.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>
                <div className="flex items-center">
                  <span>📌 Selected Keywords</span>
                  <span className="ml-2 text-sm text-muted-foreground">({selectedKeywords.length})</span>
                </div>
              </CardTitle>
              <CardDescription>
                Keywords you've selected for your listing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedKeywords.map((keyword, index) => (
                  <div key={`${keyword.keyword}-${index}`} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{keyword.keyword}</span>
                      <div className="flex items-center text-xs text-muted-foreground">
                        {renderTrendIcon(keyword.trend)}
                        <span className="ml-1">{(keyword.competition * 100).toFixed(0)}% competition</span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-xs text-muted-foreground hover:text-destructive"
                      onClick={() => removeKeyword(keyword)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              
              {/* JSON display of selected keywords */}
              <pre className="mt-4 text-sm bg-muted p-4 rounded overflow-auto">
                {JSON.stringify(selectedKeywords, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SeoKeywordAnalysis;
