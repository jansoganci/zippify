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

// Enhanced logging utility functions for professional error tracking
const logRequest = (action: string, data: any, metadata: any = {}) => {
  const logData = {
    action,
    timestamp: new Date().toISOString(),
    component: 'AdvancedKeywordAnalysis',
    data,
    ...metadata
  };
  logger.info(`🔍 [REQUEST] ${action}`, logData);
  console.log(`🔍 [ADVANCED-KEYWORD] ${action}`, logData);
};

const logResponse = (action: string, success: boolean, data: any, metadata: any = {}) => {
  const logData = {
    action,
    success,
    timestamp: new Date().toISOString(),
    component: 'AdvancedKeywordAnalysis',
    data,
    ...metadata
  };
  
  if (success) {
    logger.info(`✅ [SUCCESS] ${action}`, logData);
    console.log(`✅ [ADVANCED-KEYWORD] ${action}`, logData);
  } else {
    logger.error(`❌ [ERROR] ${action}`, logData);
    console.error(`❌ [ADVANCED-KEYWORD] ${action}`, logData);
  }
};

const logError = (error: any, context: string, metadata: any = {}) => {
  const errorData = {
    context,
    timestamp: new Date().toISOString(),
    component: 'AdvancedKeywordAnalysis',
    error: {
      message: error?.message || 'Unknown error',
      name: error?.name,
      stack: error?.stack,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    },
    ...metadata
  };
  
  logger.error(`🚨 [ERROR] ${context}`, errorData);
  console.error(`🚨 [ADVANCED-KEYWORD-ERROR] ${context}`, errorData);
  
  // Also log to console for immediate debugging
  console.group(`🚨 Advanced Keyword Analysis Error - ${context}`);
  console.error('Error Details:', error);
  console.error('Full Context:', errorData);
  console.groupEnd();
};

const logPerformance = (action: string, startTime: number, metadata: any = {}) => {
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  const perfData = {
    action,
    duration,
    timestamp: new Date().toISOString(),
    component: 'AdvancedKeywordAnalysis',
    ...metadata
  };
  
  logger.info(`⏱️ [PERFORMANCE] ${action} took ${duration}ms`, perfData);
  console.log(`⏱️ [ADVANCED-KEYWORD-PERF] ${action}`, perfData);
};

interface FormValues {
  keyword: string;
  geo: string;
}

interface QuotaInfo {
  currentUsage: number;
  limit: number;
  remaining: number;
  percentage: number;
  plan: string;
}

interface TrendPoint {
  date: string;
  value: number;
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
  isFallback?: boolean;
  fallbackReason?: string;
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

  // Log component initialization
  useEffect(() => {
    logRequest('component_initialization', {
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
    
    const token = localStorage.getItem('zippify_token');
    if (!token) {
      logError(
        new Error('No authentication token found'), 
        'component_initialization',
        { redirectTo: '/login' }
      );
      navigate('/login');
      return;
    }
    
    logRequest('auth_token_check', { 
      tokenPresent: true,
      tokenLength: token.length 
    });
    
    loadQuotaInfo();
  }, [navigate]);

  const form = useForm<FormValues>({
    defaultValues: {
      keyword: "",
      geo: "US",
    },
  });

  const loadQuotaInfo = async () => {
    const startTime = Date.now();
    
    try {
      logRequest('load_quota_info', {
        endpoint: 'advanced-keywords/quota'
      });
      
      const response = await backendApi.get('advanced-keywords/quota');
      
      logPerformance('load_quota_info', startTime, {
        status: response.status,
        success: response.data.success
      });
      
      if (response.status === 200 && response.data.success) {
        setQuotaInfo(response.data.data);
        
        logResponse('load_quota_info', true, response.data.data, {
          currentUsage: response.data.data.currentUsage,
          limit: response.data.data.limit,
          remaining: response.data.data.remaining
        });
      } else {
        throw new Error(`Invalid response: ${response.status}`);
      }
    } catch (error: any) {
      logError(error, 'load_quota_info', {
        duration: Date.now() - startTime,
        endpoint: 'advanced-keywords/quota'
      });
      
      logResponse('load_quota_info', false, null, {
        error: error?.message,
        status: error?.response?.status
      });
    }
  };

  const onSubmit = async (data: FormValues) => {
    const startTime = Date.now();
    const requestId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Clear previous state
    setError(null);
    setLoading(true);
    setKeywordData(null);
    
    logRequest('keyword_analysis_start', {
      requestId,
      keyword: data.keyword,
      geo: data.geo,
      keywordLength: data.keyword.length
    });
    
    try {
      // Validate input
      if (!data.keyword.trim()) {
        throw new Error('Keyword cannot be empty');
      }
      
      if (data.keyword.length < 2) {
        throw new Error('Keyword must be at least 2 characters long');
      }
      
      if (data.keyword.length > 100) {
        throw new Error('Keyword cannot exceed 100 characters');
      }
      
      logRequest('input_validation_passed', {
        requestId,
        keyword: data.keyword,
        geo: data.geo
      });
      
      // Make API request
      logRequest('api_request_start', {
        requestId,
        endpoint: 'advanced-keywords/analyze',
        method: 'POST',
        payload: data
      });
      
      const response = await backendApi.post('advanced-keywords/analyze', data, {
        headers: {
          'X-Request-ID': requestId
        }
      });
      
      logPerformance('api_request', startTime, {
        requestId,
        status: response.status,
        dataSize: JSON.stringify(response.data).length
      });
      
      // Validate response
      if (!response.data) {
        throw new Error('Empty response from server');
      }
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Analysis failed');
      }
      
      const responseData = response.data;
      
      if (!responseData.data) {
        throw new Error('No analysis data in response');
      }
      
      logResponse('keyword_analysis', true, {
        keyword: responseData.data.keyword,
        fromCache: responseData.data.fromCache,
        timelineDataPoints: responseData.data.timelineData?.length || 0,
        topQueriesCount: responseData.data.relatedQueries?.top?.length || 0,
        risingQueriesCount: responseData.data.relatedQueries?.rising?.length || 0
      }, {
        requestId,
        processingTime: responseData.meta?.processingTimeMs
      });
      
      setKeywordData(responseData.data);
      await loadQuotaInfo(); // Refresh quota info after successful request
      
      // Show success toast - with fallback warning if applicable
      if (responseData.data.isFallback) {
        toast({
          title: "Analysis Complete (Limited Data)",
          description: `Analyzed "${responseData.data.keyword}" with fallback data. ${responseData.data.fallbackReason || 'Full data temporarily unavailable.'}`,
          variant: "default"
        });
      } else {
        toast({
          title: "Analysis Complete!",
          description: `Successfully analyzed "${responseData.data.keyword}"${responseData.data.fromCache ? ' (from cache)' : ''}`,
          variant: "default"
        });
      }
      
      logRequest('analysis_success_notification', {
        requestId,
        keyword: responseData.data.keyword,
        fromCache: responseData.data.fromCache
      });
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      logError(error, 'keyword_analysis', {
        requestId,
        keyword: data.keyword,
        geo: data.geo,
        duration,
        userInput: data
      });
      
      logResponse('keyword_analysis', false, null, {
        requestId,
        error: error?.message,
        status: error?.response?.status,
        duration
      });
      
      setError(error?.response?.data?.message || error?.message || "Failed to analyze keyword. Please try again.");
      setKeywordData(null);
      
      // Show error toast
      toast({
        title: "Analysis Failed",
        description: error?.message || "Please try again",
        variant: "destructive"
      });
      
    } finally {
      setLoading(false);
      
      logPerformance('keyword_analysis_complete', startTime, {
        requestId,
        keyword: data.keyword,
        success: !error
      });
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    logRequest('toggle_section', {
      section,
      newState: !expandedSections[section]
    });
    
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
    logRequest('render_trend_chart', {
      dataPoints: timelineData.length,
      dateRange: timelineData.length > 0 ? {
        start: timelineData[0]?.date,
        end: timelineData[timelineData.length - 1]?.date
      } : null
    });
    
    const maxValue = Math.max(...timelineData.map(point => point.value));
    const minValue = Math.min(...timelineData.map(point => point.value));
    
    return (
      <div className="space-y-4">
        <div className="h-64 flex items-end justify-between px-2 border-b border-muted/30">
          {timelineData.map((point, index) => {
            const height = maxValue > 0 ? (point.value / maxValue) * 240 : 0;
            return (
              <div key={index} className="flex flex-col items-center group">
                <div
                  className="bg-gradient-to-t from-primary to-primary/60 rounded-t group-hover:from-primary/80 group-hover:to-primary/40 transition-colors cursor-pointer"
                  style={{ 
                    height: `${height}px`, 
                    minHeight: point.value > 0 ? '4px' : '2px',
                    width: `${Math.max(100 / timelineData.length - 1, 2)}%` 
                  }}
                  title={`${new Date(point.date).toLocaleDateString()}: ${point.value}`}
                />
                <span className="text-xs text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {point.value}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>12 months ago</span>
          <span>Today</span>
        </div>
      </div>
    );
  };

  // Log component render
  useEffect(() => {
    logRequest('component_render', {
      hasKeywordData: !!keywordData,
      hasQuotaInfo: !!quotaInfo,
      hasError: !!error,
      isLoading: loading
    });
  });

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
                            onChange={(e) => {
                              field.onChange(e);
                              logRequest('form_input_change', {
                                field: 'keyword',
                                value: e.target.value,
                                length: e.target.value.length
                              });
                            }}
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
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            logRequest('form_select_change', {
                              field: 'geo',
                              value: value
                            });
                          }} 
                          defaultValue={field.value}
                        >
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
                  onClick={() => {
                    logRequest('form_submit_clicked', {
                      keyword: form.getValues('keyword'),
                      geo: form.getValues('geo')
                    });
                  }}
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
              {/* Fallback Warning */}
              {keywordData.isFallback && (
                <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                  <Info className="h-4 w-4 text-orange-600" />
                  <AlertTitle className="text-orange-800 dark:text-orange-200">Limited Data Available</AlertTitle>
                  <AlertDescription className="text-orange-700 dark:text-orange-300">
                    {keywordData.fallbackReason || 'Google Trends API is temporarily unavailable. Showing baseline data for reference.'}
                    <br />
                    <span className="text-sm italic">Try again later for complete analysis data.</span>
                  </AlertDescription>
                </Alert>
              )}
              
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