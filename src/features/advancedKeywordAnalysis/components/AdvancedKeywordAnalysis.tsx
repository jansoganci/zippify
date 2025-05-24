import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  BarChart3,
  Globe,
  Clock,
  Users,
  AlertCircle,
  Info,
  ChevronDown,
  RefreshCw,
  Sparkles,
  Target,
  Zap
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";

// Create component-specific logger
const logger = createLogger('AdvancedKeywordAnalysis');

interface FormValues {
  keyword: string;
  geo: string;
}

interface TrendPoint {
  date: string;
  value: number;
  formattedDate: string;
}

interface RelatedQuery {
  query: string;
  value: number | string;
}

interface AdvancedKeywordData {
  keyword: string;
  timelineData: TrendPoint[];
  statistics: {
    averageInterest: number;
    maxInterest: number;
    minInterest: number;
    totalDataPoints: number;
    trend: 'rising' | 'stable' | 'declining';
  };
  relatedQueries: {
    top: RelatedQuery[];
    rising: RelatedQuery[];
  };
  estimatedSearchVolume: string;
  competitionLevel: string;
  lastUpdated: string;
  fromCache: boolean;
}

interface QuotaInfo {
  currentUsage: number;
  limit: number;
  remaining: number;
  percentage: number;
  plan: string;
  resetDate: string;
}

const AdvancedKeywordAnalysis = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [keywordData, setKeywordData] = useState<AdvancedKeywordData | null>(null);
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    trends: true,
    related: true,
    metrics: true
  });

  // Check for auth token and load quota on component mount
  useEffect(() => {
    const token = localStorage.getItem('zippify_token');
    if (!token) {
      logger.warn('No authentication token found - redirecting to login');
      navigate('/login');
      return;
    }
    
    loadQuotaInfo();
  }, [navigate]);

  const form = useForm<FormValues>({
    defaultValues: {
      keyword: "",
      geo: "US",
    },
  });

  const loadQuotaInfo = async () => {
    try {
      const response = await backendApi.get('advanced-keywords/quota');
      if (response.status === 200 && response.data.success) {
        setQuotaInfo(response.data.data);
      }
    } catch (error: any) {
      logger.warn('Failed to load quota info', { error: error.message });
    }
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('Requesting advanced keyword analysis', { 
        keyword: data.keyword, 
        geo: data.geo 
      });
      
      const requestBody = {
        keyword: data.keyword.trim(),
        geo: data.geo === 'GLOBAL' ? '' : data.geo  // Global için boş string gönder
      };
      
      const response = await backendApi.post('advanced-keywords/analyze', requestBody);
      
      // Handle error responses
      if (response.status !== 200) {
        if (response.status === 401) {
          logger.warn('Authentication failed - redirecting to login');
          navigate('/login');
          return;
        }
        
        if (response.status === 429) {
          const errorData = response.data;
          let errorMessage = "You have reached your daily quota limit.";
          
          if (errorData.errorType === 'QUOTA_EXCEEDED') {
            errorMessage = errorData.error;
          }
          
          toast({
            title: "Quota Exceeded",
            description: errorMessage,
            variant: "destructive"
          });
          
          setError(errorMessage);
          await loadQuotaInfo(); // Refresh quota info
          return;
        }
        
        if (response.status === 408) {
          setError("Request timeout - Google Trends API is taking too long to respond. Please try again.");
          return;
        }
        
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      // Process response data
      const responseData = response.data;
      
      if (!responseData.success || !responseData.data) {
        logger.error('Invalid API response structure', { responseData });
        setError("Failed to analyze keyword. Please try again.");
        return;
      }
      
      logger.info('Successfully received keyword analysis', { 
        keyword: responseData.data.keyword,
        fromCache: responseData.data.fromCache 
      });
      
      setKeywordData(responseData.data);
      await loadQuotaInfo(); // Refresh quota info after successful request
      
      // Show success toast
      toast({
        title: "Analysis Complete!",
        description: `Successfully analyzed "${responseData.data.keyword}"${responseData.data.fromCache ? ' (from cache)' : ''}`,
        variant: "default"
      });
      
    } catch (error: any) {
      logger.error('Failed to analyze keyword', { 
        message: error.message,
        status: error.response?.status 
      });
      
      setError("Failed to analyze keyword. Please try again.");
      setKeywordData(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getCompetitionColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderTrendChart = (timelineData: TrendPoint[]) => {
    if (!timelineData || timelineData.length === 0) return null;

    const chartWidth = 600;
    const chartHeight = 200;
    const padding = { top: 20, right: 20, bottom: 20, left: 40 };

    return (
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Interest Over Time</span>
          <span className="text-xs text-gray-500">Scale: 0-100</span>
        </div>
        <div className="relative h-48 border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
          <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight + padding.top + padding.bottom}`} className="w-full h-full">
            <defs>
              <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map(value => {
              const y = padding.top + chartHeight - (value / 100) * chartHeight;
              return (
                <g key={value}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke="#E5E7EB"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                  <text
                    x={padding.left - 5}
                    y={y + 4}
                    fontSize="10"
                    fill="#6B7280"
                    textAnchor="end"
                  >
                    {value}
                  </text>
                </g>
              );
            })}
            
            {/* Trend line and area */}
            <path
              d={timelineData.map((point, index) => {
                const x = padding.left + (index / (timelineData.length - 1)) * (chartWidth - padding.left - padding.right);
                const y = padding.top + chartHeight - (point.value / 100) * chartHeight;
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              className="drop-shadow-sm"
            />
            
            {/* Area fill */}
            <path
              d={`${timelineData.map((point, index) => {
                const x = padding.left + (index / (timelineData.length - 1)) * (chartWidth - padding.left - padding.right);
                const y = padding.top + chartHeight - (point.value / 100) * chartHeight;
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')} L ${padding.left + (chartWidth - padding.left - padding.right)} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`}
              fill="url(#trendGradient)"
            />
            
            {/* Data points */}
            {timelineData.map((point, index) => {
              const x = padding.left + (index / (timelineData.length - 1)) * (chartWidth - padding.left - padding.right);
              const y = padding.top + chartHeight - (point.value / 100) * chartHeight;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="3"
                  fill="#3B82F6"
                  className="hover:r-4 transition-all cursor-pointer"
                >
                  <title>{`${point.formattedDate}: ${point.value}`}</title>
                </circle>
              );
            })}
          </svg>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>12 months ago</span>
          <span>Today</span>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayoutFixed>
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <div className="flex flex-col space-y-8">
          {/* Page Header - SEO Style */}
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-1 bg-gradient-to-b from-primary to-primary/40 rounded-full"></div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">Advanced Keyword Analysis</h1>
                </div>
                <p className="text-muted-foreground pl-4 border-l-2 border-muted/30 dark:border-muted/10">
                  Powered by Google Trends - Get deep insights into keyword performance and trends
                </p>
              </div>
              
              {quotaInfo && (
                <Card className="w-64 border-muted/40 dark:border-muted/20 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Daily Usage</span>
                      <Badge variant="outline" className="text-xs">
                        {quotaInfo.plan}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Progress value={quotaInfo.percentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{quotaInfo.currentUsage}/{quotaInfo.limit} used</span>
                        <span>{quotaInfo.remaining} remaining</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Analysis Form - SEO Style */}
          <Card className="w-full border-muted/40 dark:border-muted/20 shadow-sm overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-primary to-primary/60 dark:from-primary dark:to-primary/40 rounded-t-sm"></div>
            <CardHeader className="bg-muted/10 dark:bg-muted/5 pb-3">
              <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span>Advanced Analysis Parameters</span>
              </CardTitle>
              <CardDescription>
                Enter a keyword to analyze its Google Trends data, related queries, and market insights
              </CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="keyword"
                    rules={{
                      required: "Keyword is required",
                      minLength: { value: 2, message: "Keyword must be at least 2 characters" },
                      maxLength: { value: 100, message: "Keyword must not exceed 100 characters" }
                    }}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Keyword</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., handmade jewelry, digital marketing" 
                            {...field}
                            disabled={loading}
                            className="border-input/60 focus-visible:ring-primary/20 bg-background"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="geo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Geographic Region</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger disabled={loading}>
                              <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="US">United States</SelectItem>
                            <SelectItem value="GB">United Kingdom</SelectItem>
                            <SelectItem value="CA">Canada</SelectItem>
                            <SelectItem value="AU">Australia</SelectItem>
                            <SelectItem value="DE">Germany</SelectItem>
                            <SelectItem value="GLOBAL">Global</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full sm:w-auto"
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
                      Analyze Keyword
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Analysis Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

          {/* Results */}
          {keywordData && (
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-muted/40 dark:border-muted/20 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Trend</p>
                      <p className="text-2xl font-bold capitalize text-foreground">
                        {keywordData.statistics.trend}
                      </p>
                    </div>
                    {getTrendIcon(keywordData.statistics.trend)}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-muted/40 dark:border-muted/20 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Avg Interest</p>
                      <p className="text-2xl font-bold text-foreground">
                        {keywordData.statistics.averageInterest}
                      </p>
                    </div>
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-muted/40 dark:border-muted/20 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Competition</p>
                      <Badge className={getCompetitionColor(keywordData.competitionLevel)}>
                        {keywordData.competitionLevel}
                      </Badge>
                    </div>
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-muted/40 dark:border-muted/20 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Search Volume</p>
                      <p className="text-sm font-bold text-primary">
                        {keywordData.estimatedSearchVolume}
                      </p>
                    </div>
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trend Chart */}
            <Collapsible 
              open={expandedSections.trends} 
              onOpenChange={() => toggleSection('trends')}
            >
              <Card className="border-muted/40 dark:border-muted/20 shadow-sm overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-primary to-primary/60 dark:from-primary dark:to-primary/40 rounded-t-sm"></div>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/10 dark:hover:bg-muted/5 transition-colors bg-muted/10 dark:bg-muted/5">
                    <CardTitle className="flex items-center justify-between text-xl font-semibold text-foreground">
                      <span className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Interest Over Time
                      </span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.trends ? 'rotate-180' : ''}`} />
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    {renderTrendChart(keywordData.timelineData)}
                    <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Peak Interest</p>
                        <p className="text-lg font-semibold text-foreground">{keywordData.statistics.maxInterest}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Average</p>
                        <p className="text-lg font-semibold text-foreground">{keywordData.statistics.averageInterest}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Data Points</p>
                        <p className="text-lg font-semibold text-foreground">{keywordData.statistics.totalDataPoints}</p>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Related Queries */}
            <Collapsible 
              open={expandedSections.related} 
              onOpenChange={() => toggleSection('related')}
            >
              <Card className="border-muted/40 dark:border-muted/20 shadow-sm overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-primary to-primary/60 dark:from-primary dark:to-primary/40 rounded-t-sm"></div>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/10 dark:hover:bg-muted/5 transition-colors bg-muted/10 dark:bg-muted/5">
                    <CardTitle className="flex items-center justify-between text-xl font-semibold text-foreground">
                      <span className="flex items-center gap-2">
                        <Search className="h-5 w-5 text-primary" />
                        Related Queries
                      </span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.related ? 'rotate-180' : ''}`} />
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Top Queries */}
                      <div>
                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-primary" />
                          Top Related
                        </h4>
                        <div className="space-y-2">
                          {keywordData.relatedQueries.top.slice(0, 8).map((query, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted/20 dark:bg-muted/10 rounded">
                              <span className="text-sm text-foreground">{query.query}</span>
                              <Badge variant="secondary" className="text-xs">
                                {typeof query.value === 'number' ? query.value : query.value}
                              </Badge>
                            </div>
                          ))}
                          {keywordData.relatedQueries.top.length === 0 && (
                            <p className="text-sm text-muted-foreground italic">No top queries available</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Rising Queries */}
                      <div>
                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          Rising Queries
                        </h4>
                        <div className="space-y-2">
                          {keywordData.relatedQueries.rising.slice(0, 8).map((query, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-primary/10 dark:bg-primary/5 rounded">
                              <span className="text-sm text-foreground">{query.query}</span>
                              <Badge variant="secondary" className="text-xs bg-primary/20 text-primary dark:bg-primary/10 dark:text-primary">
                                {typeof query.value === 'number' ? `+${query.value}%` : query.value}
                              </Badge>
                            </div>
                          ))}
                          {keywordData.relatedQueries.rising.length === 0 && (
                            <p className="text-sm text-muted-foreground italic">No rising queries available</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Additional Metrics */}
            <Collapsible 
              open={expandedSections.metrics} 
              onOpenChange={() => toggleSection('metrics')}
            >
              <Card className="border-muted/40 dark:border-muted/20 shadow-sm overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-primary to-primary/60 dark:from-primary dark:to-primary/40 rounded-t-sm"></div>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/10 dark:hover:bg-muted/5 transition-colors bg-muted/10 dark:bg-muted/5">
                    <CardTitle className="flex items-center justify-between text-xl font-semibold text-foreground">
                      <span className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        Analysis Details
                      </span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.metrics ? 'rotate-180' : ''}`} />
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-primary/10 dark:bg-primary/5 rounded">
                          <span className="font-medium text-foreground">Analyzed Keyword</span>
                          <Badge variant="default">{keywordData.keyword}</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/20 dark:bg-muted/10 rounded">
                          <span className="font-medium text-foreground">Data Source</span>
                          <span className="text-sm text-muted-foreground">{keywordData.fromCache ? 'Cached Data' : 'Live Data'}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/20 dark:bg-muted/10 rounded">
                          <span className="font-medium text-foreground">Last Updated</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(keywordData.lastUpdated).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/5 dark:to-primary/5 rounded-lg border border-primary/20 dark:border-primary/10">
                          <h5 className="font-semibold text-foreground mb-2">Market Insights</h5>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Peak interest: {keywordData.statistics.maxInterest}/100</li>
                            <li>• Trend direction: {keywordData.statistics.trend}</li>
                            <li>• Competition level: {keywordData.competitionLevel}</li>
                            <li>• Est. monthly searches: {keywordData.estimatedSearchVolume}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Info Footer */}
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertTitle>Data Information</AlertTitle>
              <AlertDescription>
                This analysis is based on Google Trends data and provides relative search interest over time. 
                Data is normalized on a scale of 0-100, where 100 represents peak interest for the selected time period and region.
                {keywordData.fromCache && " This data was retrieved from cache and may be up to 24 hours old."}
              </AlertDescription>
            </Alert>
          </div>
        )}
        </div>
      </div>
    </DashboardLayoutFixed>
  );
};

export default AdvancedKeywordAnalysis; 