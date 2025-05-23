import React, { useState } from "react";
import { createLogger } from '@/utils/logger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

// Create logger for this component
const logger = createLogger('EditImageGPT');
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
  Wand2
} from "lucide-react";
import DashboardLayoutFixed from "@/components/DashboardLayoutFixed";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import batch processing components
import BatchUploader from "./components/BatchUploader";
import BatchResults, { BatchImageResult } from "./components/BatchResults";
import PromptTemplateSelector from "./components/PromptTemplateSelector";
import ExamplePromptLibrary from "./components/ExamplePromptLibrary";

// Function to call the OpenAI GPT Image API through our backend endpoint
const callOpenAIGptImageApi = async (base64Image: string, prompt: string) => {
  logger.debug('Calling OpenAI GPT Image API', { 
    imageLength: base64Image.length, 
    promptPreview: prompt.substring(0, 50) + (prompt.length > 50 ? '...' : '') 
  });
  
  try {
    // Send POST request to our backend endpoint
    const response = await fetch('/image/edit/gpt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
        prompt: prompt
      })
    });
    
    // Parse the JSON response first, regardless of HTTP status
    const data = await response.json();
    logger.debug('Received response from OpenAI GPT Image API', { success: data.success });
    
    // Check the success field in the response data
    if (!data.success) {
      throw new Error(data.message || `Server responded with status: ${response.status}`);
    }
    
    // Log if the prompt was enhanced
    if (data.promptEnhanced && data.enhancedPrompt) {
      logger.debug('OpenAI GPT prompt enhanced', { 
        originalPrompt: prompt.substring(0, 50) + '...', 
        enhancedPrompt: data.enhancedPrompt.substring(0, 50) + '...' 
      });
    }
    
    // Process the successful response
    if (data.result && data.result.image) {
      // Handle both URL and base64 image responses
      const imageData = data.result.image;
      
      // If the image is a URL (from OpenAI API), fetch it and convert to base64
      if (typeof imageData === 'string' && imageData.startsWith('http')) {
        try {
          const imageResponse = await fetch(imageData);
          const blob = await imageResponse.blob();
          const reader = new FileReader();
          
          const base64Result = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          
          return {
            success: true,
            image: base64Result,
            responseText: data.result.responseText || "Image edited with OpenAI GPT",
            enhancedPrompt: data.enhancedPrompt,
            promptEnhanced: data.promptEnhanced
          };
        } catch (fetchError) {
          logger.error('Failed to fetch image from OpenAI URL', { error: fetchError instanceof Error ? fetchError.message : String(fetchError) });
          // Return the URL directly if we can't fetch it
          return {
            success: true,
            image: imageData,
            responseText: data.result.responseText || "Image edited with OpenAI GPT",
            enhancedPrompt: data.enhancedPrompt,
            promptEnhanced: data.promptEnhanced
          };
        }
      }
      
      // If it's already a base64 string, ensure it has the proper prefix
      const formattedImageData = imageData.startsWith('data:image') 
        ? imageData 
        : `data:image/png;base64,${imageData}`;
      
      return {
        success: true,
        image: formattedImageData,
        responseText: data.result.responseText || "Image edited with OpenAI GPT",
        enhancedPrompt: data.enhancedPrompt,
        promptEnhanced: data.promptEnhanced
      };
    } else {
      throw new Error("Invalid response format from server: missing image data");
    }
  } catch (error) {
    logger.error('OpenAI GPT Image API call failed', { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

// Process a single image edit using the OpenAI GPT API
const processSingleImageEdit = async (image: string, prompt: string) => {
  try {
    logger.debug('Processing single image edit with OpenAI GPT');
    const result = await callOpenAIGptImageApi(image, prompt);
    
    if (result.success) {
      return {
        success: true,
        image: result.image,
        responseText: result.responseText,
        enhancedPrompt: result.enhancedPrompt,
        promptEnhanced: result.promptEnhanced
      };
    } else {
      throw new Error("Failed to process image with OpenAI GPT");
    }
  } catch (error) {
    logger.error('Single image processing failed with OpenAI GPT', { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

// Process batch of images using the OpenAI GPT API
const processBatchImageEdits = async (
  images: File[], 
  prompt: string, 
  onProgress: (index: number, status: BatchImageResult['status'], result?: string, errorMsg?: string) => void
) => {
  const results: BatchImageResult[] = [];
  
  for (let i = 0; i < images.length; i++) {
    try {
      // Update status to processing
      onProgress(i, 'processing');
      
      // Convert file to base64
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(images[i]);
      });
      
      // Process with OpenAI GPT
      const result = await callOpenAIGptImageApi(base64Image, prompt);
      
      if (result.success) {
        onProgress(i, 'completed', result.image);
        results.push({
          fileName: images[i].name,
          originalImage: base64Image,
          editedImage: result.image,
          status: 'completed'
        });
      } else {
        throw new Error("Failed to process image");
      }
    } catch (error) {
      logger.error(`Batch image processing failed for image ${i}`, { error: error instanceof Error ? error.message : String(error) });
      onProgress(i, 'error', undefined, error instanceof Error ? error.message : 'Unknown error');
      results.push({
        fileName: images[i].name,
        originalImage: '',
        editedImage: null,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  return results;
};

const EditImageGPT = () => {
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
      logger.debug('Image selected for GPT editing', { 
        fileName: file.name, 
        sizeKB: (file.size / 1024).toFixed(2), 
        type: file.type 
      });
      
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size exceeds 5MB limit. Please select a smaller image.");
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = () => {
        logger.debug('Image successfully loaded and converted to base64 for GPT editing');
        setSelectedImage(reader.result as string);
      };
      
      reader.onerror = () => {
        logger.error('Failed to read image file for GPT editing', { error: reader.error });
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
    
    logger.debug('Submitting GPT image edit request', { prompt: prompt.substring(0, 50) + '...' });
    setIsLoading(true);
    
    try {
      // Process the image edit using the OpenAI GPT service function
      const result = await processSingleImageEdit(selectedImage, prompt);
      
      if (result.image) {
        setGeneratedImage(result.image);
        
        if (result.responseText) {
          setResponseText(result.responseText);
        }
        
        // Show a toast notification if the prompt was enhanced
        if (result.promptEnhanced && result.enhancedPrompt) {
          toast({
            title: "Prompt Enhanced",
            description: "We've improved your editing instructions for better results.",
            variant: "default",
            duration: 5000,
          });
          
          // Log the original and enhanced prompts for debugging
          logger.debug('GPT prompt enhancement applied', { 
            originalPrompt: prompt.substring(0, 50) + '...', 
            enhancedPrompt: result.enhancedPrompt.substring(0, 50) + '...' 
          });
        }
        
        logger.debug('Image successfully processed with OpenAI GPT');
        toast({
          title: "Image Edited Successfully",
          description: "Your image has been processed with OpenAI GPT.",
        });
      } else {
        throw new Error("No image returned from OpenAI GPT");
      }
    } catch (error) {
      logger.error('GPT image processing failed', { error: error instanceof Error ? error.message : String(error) });
      setError(error instanceof Error ? error.message : "Failed to process image with OpenAI GPT");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process image with OpenAI GPT. Please try again.",
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
      setError("Please select images and enter a prompt");
      return;
    }
    
    setIsBatchProcessing(true);
    setBatchResults(selectedFiles.map(file => ({
      fileName: file.name,
      originalImage: '',
      editedImage: null,
      status: 'pending'
    })));
    
    try {
      // Define the progress callback function
      const handleProgressUpdate = (
        index: number, 
        status: BatchImageResult['status'], 
        result?: string, 
        errorMsg?: string
      ) => {
        setBatchResults(prev => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            status,
            ...(result && { editedImage: result }),
            ...(errorMsg && { error: errorMsg })
          };
          return updated;
        });
      };
      
      // Process all images
      await processBatchImageEdits(selectedFiles, prompt, handleProgressUpdate);
      
      toast({
        title: "Batch Processing Complete",
        description: `Processed ${selectedFiles.length} images with OpenAI GPT.`,
      });
    } catch (error) {
      logger.error('GPT batch processing failed', { error: error instanceof Error ? error.message : String(error) });
      toast({
        variant: "destructive",
        title: "Batch Processing Error",
        description: error instanceof Error ? error.message : "An error occurred during batch processing",
      });
    } finally {
      setIsBatchProcessing(false);
    }
  };

  return (
    <DashboardLayoutFixed>
      <div className="container max-w-screen-xl mx-auto py-6">
        <div className="space-y-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Image Editor (GPT)</h1>
            <p className="text-muted-foreground">
              Edit your product images using OpenAI GPT image editing capabilities.
            </p>
          </div>

          <Tabs defaultValue="single" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="single" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Single Image Edit
              </TabsTrigger>
              <TabsTrigger value="batch" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Batch Processing
              </TabsTrigger>
            </TabsList>
            
          <TabsContent value="single" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input Card */}
              <Card className="border-muted/40 dark:border-muted/20 shadow-sm overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-primary to-primary/60 dark:from-primary dark:to-primary/40"></div>
                <CardHeader className="bg-muted/10 dark:bg-muted/5 pb-3">
                  <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    Upload Image
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Upload an image to edit with OpenAI GPT
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleSingleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="image-upload" className="flex items-center gap-2 text-foreground">
                        <div className="p-1.5 rounded-md bg-primary/10 dark:bg-primary/20">
                          <ImageIcon className="h-4 w-4 text-primary" />
                        </div>
                        Product Image
                      </Label>
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 transition-all hover:border-muted-foreground/40">
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          disabled={isLoading}
                        />
                        {selectedImage ? (
                          <div className="w-full space-y-2">
                            <img
                              src={selectedImage}
                              alt="Selected"
                              className="w-full h-auto max-h-[300px] object-contain rounded-md"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full border-input/60"
                              onClick={() => document.getElementById('image-upload')?.click()}
                              disabled={isLoading}
                            >
                              Change Image
                            </Button>
                          </div>
                        ) : (
                          <div
                            className="flex flex-col items-center justify-center cursor-pointer"
                            onClick={() => document.getElementById('image-upload')?.click()}
                          >
                            <div className="p-3 rounded-full bg-muted/30 mb-2">
                              <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="text-center space-y-1">
                              <p className="text-sm font-medium text-foreground">Click to upload</p>
                              <p className="text-xs text-muted-foreground">
                                PNG, JPG or WEBP (max. 5MB)
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 group">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="prompt" className="flex items-center gap-2 text-foreground">
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
                        id="prompt"
                        placeholder="Describe how you want to edit the image..."
                        className="min-h-[100px] border-input/60 focus-visible:ring-primary/20 bg-background"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={isLoading}
                      />
                      
                      {/* Commented out due to prop type mismatch - will need to update PromptTemplateSelector component
                      <PromptTemplateSelector 
                        platform={platform}
                        category={category}
                        onPlatformChange={setPlatform}
                        onCategoryChange={setCategory}
                        onSelectTemplate={(template) => setPrompt(template)}
                      />
                      */}
                    </div>
                    
                    {error && (
                      <Alert variant="destructive" className="bg-destructive/5 text-destructive border-destructive/20">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    
                    <Button 
                      type="submit" 
                      className="w-full shadow-sm" 
                      disabled={isLoading || !selectedImage || !prompt.trim()}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>Edit with OpenAI GPT</>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Result Card */}
              <Card className="border-muted/40 dark:border-muted/20 shadow-sm overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-primary to-primary/60 dark:from-primary dark:to-primary/40"></div>
                <CardHeader className="bg-muted/10 dark:bg-muted/5 pb-3">
                  <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-primary" />
                    Edited Result
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Your image after OpenAI GPT processing
                  </CardDescription>
                </CardHeader>
                <CardContent className="min-h-[200px] flex items-center justify-center">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center text-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                      <p className="text-muted-foreground">Processing your image with OpenAI GPT...</p>
                      <p className="text-xs text-muted-foreground mt-2">This may take a few moments</p>
                    </div>
                  ) : generatedImage ? (
                    <div className="w-full space-y-4">
                      <img
                        src={generatedImage}
                        alt="Generated"
                        className="w-full h-auto max-h-[300px] object-contain rounded-md"
                      />
                      
                      {responseText && (
                        <div className="p-3 bg-muted/20 rounded-md text-sm text-muted-foreground">
                          <div className="flex items-start gap-2">
                            <InfoIcon className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                            <p>{responseText}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-8">
                      <div className="p-3 rounded-full bg-muted/30 mb-2">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">Edited image will appear here</p>
                      <p className="text-xs text-muted-foreground mt-1">Upload an image and enter a prompt to get started</p>
                    </div>
                  )}
                </CardContent>
                {generatedImage && (
                  <CardFooter className="bg-muted/10 dark:bg-muted/5 pt-3">
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => {
                        // Create a temporary anchor element to download the image
                        const a = document.createElement('a');
                        a.href = generatedImage;
                        a.download = `edited-image-${Date.now()}.png`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        
                        toast({
                          title: "Image Downloaded",
                          description: "Your edited image has been downloaded.",
                        });
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Edited Image
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="batch" className="space-y-6">
            <div className="space-y-6">
              {/* Batch Upload Component */}
              <BatchUploader 
                onImagesSelected={handleBatchImagesSelected} 
                isProcessing={isBatchProcessing}
              />
              
              {/* Batch Processing Card */}
              <Card className="border-muted/40 dark:border-muted/20 shadow-sm overflow-hidden">
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
    </DashboardLayoutFixed>
  );
};

export default EditImageGPT;

