import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import { 
  InfoIcon, 
  Download, 
  AlertTriangle, 
  Lightbulb, 
  Plus, 
  Image as ImageIcon, 
  Loader2,
  Wand2,
  Calendar
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import batch processing components
import BatchUploader from "./components/BatchUploader";
import BatchResults, { BatchImageResult } from "./components/BatchResults";
import { editImageWithPrompt, editMultipleImages, processSingleImageEdit, processBatchImageEdits } from "./editImageService";
import PromptTemplateSelector from "./components/PromptTemplateSelector";
import ExamplePromptLibrary from "./components/ExamplePromptLibrary";

const NewEditImagePage = () => {
  // Single image editing state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [responseText, setResponseText] = useState<string | null>(null);
  
  // Platform and category selection
  const [platform, setPlatform] = useState<string>("etsy");
  const [category, setCategory] = useState<string>("jewelry");
  
  // Batch image editing state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [batchResults, setBatchResults] = useState<BatchImageResult[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("single");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clear any previous errors when user takes a new action
    setError(null);
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (import.meta.env.MODE !== 'production') console.log(`Image selected: ${file.name}, size: ${(file.size / 1024).toFixed(2)}KB, type: ${file.type}`);
      
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size exceeds 5MB limit. Please select a smaller image.");
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = () => {
        if (import.meta.env.MODE !== 'production') console.log("Image successfully loaded and converted to base64");
        setSelectedImage(reader.result as string);
      };
      
      reader.onerror = () => {
        if (import.meta.env.MODE !== 'production') console.error("Error reading file:", reader.error);
        setError("Failed to read the image file. Please try another image.");
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous errors when user takes a new action
    setError(null);
    setResponseText(null);
    
    if (!selectedImage || !prompt) {
      setError("Please select an image and enter a prompt");
      return;
    }
    
    if (import.meta.env.MODE !== 'production') console.log(`Submitting image edit request with prompt: "${prompt}"`);
    setIsLoading(true);
    
    try {
      // Process the image edit using the service function
      const result = await processSingleImageEdit(selectedImage, prompt);
      
      if (result.image) {
        setGeneratedImage(result.image);
        
        // Check if responseText exists in result (using type assertion)
        const resultWithResponse = result as { image: string; error: string; responseText?: string };
        if (resultWithResponse.responseText) {
          setResponseText(resultWithResponse.responseText);
        }
        
        toast({
          title: "Image Edited Successfully",
          description: "Your image has been processed with AI",
        });
      } else if (result.error) {
        setError(result.error);
        
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle batch image selection
  const handleBatchImagesSelected = (files: File[]) => {
    setSelectedFiles(files);
    setBatchResults([]);
  };

  // Process batch of images
  const handleBatchProcess = async () => {
    if (selectedFiles.length === 0 || !prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select images and provide editing instructions",
      });
      return;
    }
    
    setIsBatchProcessing(true);
    setBatchResults(selectedFiles.map((file, index) => ({
      id: `img-${index}`,
      fileName: file.name, // Changed 'name' to 'fileName' to match BatchImageResult type
      status: 'pending',
      originalImage: URL.createObjectURL(file),
      editedImage: null,
      error: null
    })));
    
    try {
      // Define the progress callback function
      const handleProgressUpdate = (index: number, status: BatchImageResult['status'], result?: string, errorMsg?: string) => {
        setBatchResults(prev => {
          const newResults = [...prev];
          
          if (index >= 0 && index < newResults.length) {
            newResults[index] = {
              ...newResults[index],
              status,
              editedImage: result || null,
              error: errorMsg || null
            };
          }
          
          return newResults;
        });
      };
      
      // Process each image sequentially
      await processBatchImageEdits(
        selectedFiles,
        prompt,
        handleProgressUpdate, // Correct parameter order - onProgress is the third parameter
        category,
        platform
      );
      
      toast({
        title: "Batch Processing Complete",
        description: `Processed ${selectedFiles.length} images`,
      });
    } catch (error) {
      if (import.meta.env.MODE !== 'production') console.error("Batch processing error:", error);
      toast({
        title: "Processing Error",
        description: error instanceof Error ? error.message : "Failed to process images",
        variant: "destructive"
      });
    } finally {
      setIsBatchProcessing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="py-6 space-y-6">
        {/* Page Header Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-gradient-to-b from-primary to-primary/40 rounded-full"></div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Image Editor</h1>
          </div>
          <p className="text-muted-foreground pl-4 border-l-2 border-muted/30 dark:border-muted/10">
            Enhance your product images with AI-powered editing tools.
          </p>
        </div>

        <div className="rounded-lg border border-muted/60 dark:border-muted/30 shadow-sm overflow-hidden">
          <Tabs defaultValue="single" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-muted/70 to-muted/50 dark:from-muted/30 dark:to-muted/20 p-1">
              <TabsTrigger 
                value="single" 
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:font-medium"
              >
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  <span>Single Image</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="batch" 
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:font-medium"
              >
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Batch Processing</span>
                </div>
              </TabsTrigger>
            </TabsList>
          
          <TabsContent value="single" className="mt-4">
            <div className="space-y-6">
              {/* Platform and Category Selector */}
              <PromptTemplateSelector
                platform={platform}
                setPlatform={setPlatform}
                category={category}
                setCategory={setCategory}
              />
              
              {/* Single Image Editor Card */}
              <Card className="border-muted/40 dark:border-muted/20 overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-primary to-primary/60 dark:from-primary dark:to-primary/40"></div>
                <CardHeader className="bg-muted/10 dark:bg-muted/5">
                  <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-primary" />
                    Edit Product Image
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Upload an image and provide instructions for AI-powered editing.
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2 group">
                    <Label htmlFor="image-upload" className="flex items-center gap-2 text-foreground">
                      <div className="p-1.5 rounded-md bg-primary/10 dark:bg-primary/20 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors">
                        <ImageIcon className="h-4 w-4 text-primary" />
                      </div>
                      Upload Image
                    </Label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isLoading}
                      className="border-input/60 focus-visible:ring-primary/20 bg-background"
                    />
                    <Alert variant="default" className="bg-muted/50 border-muted">
                      <InfoIcon className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Only JPEG or PNG files are supported (max 5MB).
                      </AlertDescription>
                    </Alert>
                  </div>
                  
                  <div className="h-px w-full my-4 bg-border/60 dark:bg-border/40" />
                  
                  <div className="space-y-2 group">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-prompt" className="flex items-center gap-2 text-foreground">
                        <div className="p-1.5 rounded-md bg-primary/10 dark:bg-primary/20 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors">
                          <Wand2 className="h-4 w-4 text-primary" />
                        </div>
                        Edit Instructions
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 border-input/60 bg-background hover:bg-muted/20">
                            <Lightbulb className="h-3.5 w-3.5 mr-2 text-primary" />
                            Example Prompts
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent side="bottom" align="end" className="w-80 border-muted/40 dark:border-muted/20">
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm text-foreground">Example Prompts</h4>
                            <p className="text-xs text-muted-foreground">Click to use these example prompts</p>
                          </div>
                          <ExamplePromptLibrary onSelectPrompt={setPrompt} />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Textarea
                      id="edit-prompt"
                      placeholder="Describe how you want to edit the image..."
                      className="min-h-[80px] border-input/60 focus-visible:ring-primary/20 bg-background"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="h-px w-full my-4 bg-border/60 dark:bg-border/40" />
                  
                  <Button 
                    className="w-full shadow-sm" 
                    onClick={handleSingleSubmit} 
                    disabled={isLoading || !selectedImage || !prompt.trim()}
                    variant="default"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>Edit Image</>
                    )}
                  </Button>
                </CardContent>
              </Card>
              
              {/* Original Image Preview */}
              {selectedImage && !generatedImage && (
                <Card className="border-muted/40 dark:border-muted/20 overflow-hidden">
                  <CardHeader className="bg-muted/10 dark:bg-muted/5 pb-3">
                    <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-primary" />
                      Original Image
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="border border-muted/40 dark:border-muted/20 rounded-md overflow-hidden bg-muted/10 dark:bg-muted/5">
                      <img 
                        src={selectedImage} 
                        alt="Original product" 
                        className="w-full h-auto max-h-[300px] object-contain"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Results Section */}
              {generatedImage && (
                <Card className="border-muted/40 dark:border-muted/20 overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-primary to-primary/60 dark:from-primary dark:to-primary/40"></div>
                  <CardHeader className="bg-muted/10 dark:bg-muted/5 pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
                        <Wand2 className="h-4 w-4 text-primary" />
                        Edited Image
                      </CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-input/60 bg-background hover:bg-muted/20"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = generatedImage;
                          link.download = 'edited-image.png';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          
                          toast({
                            title: "Download Started",
                            description: "Your edited image download has started.",
                          });
                        }}
                      >
                        <Download className="h-3.5 w-3.5 mr-2 text-primary" />
                        Download
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h3 className="text-xs font-medium text-muted-foreground">Original</h3>
                        <div className="border border-muted/40 dark:border-muted/20 rounded-md overflow-hidden bg-muted/10 dark:bg-muted/5">
                          <img 
                            src={selectedImage} 
                            alt="Original product" 
                            className="w-full h-auto max-h-[300px] object-contain"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xs font-medium text-muted-foreground">Edited</h3>
                        <div className="border border-muted/40 dark:border-muted/20 rounded-md overflow-hidden bg-muted/10 dark:bg-muted/5">
                          <img 
                            src={generatedImage} 
                            alt="AI edited product" 
                            className="w-full h-auto max-h-[300px] object-contain"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {responseText && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                          <InfoIcon className="h-4 w-4 text-primary" />
                          AI Comments
                        </h3>
                        <div className="rounded-md border border-muted/40 dark:border-muted/20 p-4 bg-muted/10 dark:bg-muted/5">
                          <p className="whitespace-pre-wrap text-sm text-foreground">{responseText}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="batch" className="mt-4">
            <div className="space-y-6">
              {/* Platform and Category Selector */}
              <PromptTemplateSelector
                platform={platform}
                setPlatform={setPlatform}
                category={category}
                setCategory={setCategory}
              />
              
              {/* Batch Image Upload Component */}
              <BatchUploader 
                onImagesSelected={handleBatchImagesSelected} 
                isProcessing={isBatchProcessing} 
              />
              
              {/* Prompt Input for Batch Processing */}
              <Card className="border-muted/40 dark:border-muted/20 overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-primary to-primary/60 dark:from-primary dark:to-primary/40"></div>
                <CardHeader className="bg-muted/10 dark:bg-muted/5 pb-3">
                  <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-primary" />
                    Batch Edit Instructions
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Enter instructions to apply to all selected images.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2 group">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="batch-prompt" className="flex items-center gap-2 text-foreground">
                        <div className="p-1.5 rounded-md bg-primary/10 dark:bg-primary/20 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors">
                          <Wand2 className="h-4 w-4 text-primary" />
                        </div>
                        Edit Instructions
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 border-input/60 bg-background hover:bg-muted/20">
                            <Lightbulb className="h-3.5 w-3.5 mr-2 text-primary" />
                            Example Prompts
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent side="bottom" align="end" className="w-80 border-muted/40 dark:border-muted/20">
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm text-foreground">Example Prompts</h4>
                            <p className="text-xs text-muted-foreground">Click to use these example prompts</p>
                          </div>
                          <ExamplePromptLibrary onSelectPrompt={setPrompt} />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Textarea
                      id="batch-prompt"
                      placeholder="Apply the same edit to all images..."
                      className="min-h-[80px] border-input/60 focus-visible:ring-primary/20 bg-background"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      disabled={isBatchProcessing}
                    />
                  </div>
                  
                  <div className="h-px w-full my-4 bg-border/60 dark:bg-border/40" />
                  
                  <Button 
                    className="w-full shadow-sm" 
                    onClick={handleBatchProcess} 
                    disabled={isBatchProcessing || selectedFiles.length === 0 || !prompt.trim()}
                    variant="default"
                  >
                    {isBatchProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing {batchResults.filter(r => r.status === 'completed').length}/{selectedFiles.length} Images...
                      </>
                    ) : (
                      <>Start Batch Processing {selectedFiles.length} Images</>
                    )}
                  </Button>
                </CardContent>
              </Card>
              
              {/* Batch Results Component */}
              {batchResults.length > 0 && (
                <BatchResults 
                  results={batchResults} 
                  isProcessing={isBatchProcessing} 
                />
              )}
            </div>
          </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewEditImagePage;
