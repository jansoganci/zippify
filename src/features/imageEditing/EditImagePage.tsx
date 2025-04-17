import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import { InfoIcon, Download, AlertTriangle, Lightbulb, Plus, Image as ImageIcon, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import batch processing components
import BatchUploader from "./components/BatchUploader";
import BatchResults, { BatchImageResult } from "./components/BatchResults";
import { editImageWithPrompt, editMultipleImages, processSingleImageEdit, processBatchImageEdits } from "./editImageService";
import PromptTemplateSelector from "./components/PromptTemplateSelector";
import ExamplePromptLibrary from "./components/ExamplePromptLibrary";

const EditProductImage = () => {
  // Single image editing state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
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
      console.log(`Image selected: ${file.name}, size: ${(file.size / 1024).toFixed(2)}KB, type: ${file.type}`);
      
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size exceeds 5MB limit. Please select a smaller image.");
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = () => {
        console.log("Image successfully loaded and converted to base64");
        setSelectedImage(reader.result as string);
      };
      
      reader.onerror = () => {
        console.error("Error reading file:", reader.error);
        setError("Failed to read the image file. Please try another image.");
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous errors when user takes a new action
    setError(null);
    
    if (!selectedImage || !prompt) {
      setError("Please select an image and enter a prompt");
      return;
    }
    
    console.log(`Submitting image edit request with prompt: "${prompt}"`);
    setIsLoading(true);
    
    // Process the image edit using the service function
    const result = await processSingleImageEdit(selectedImage, prompt);
    
    if (result.image) {
      setGeneratedImage(result.image);
      
      toast({
        title: "Image Edited Successfully",
        description: "Your image has been processed with AI",
      });
    } else if (result.error) {
      setError(result.error);
      
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  // Handle batch image selection
  const handleBatchImagesSelected = (files: File[]) => {
    setSelectedFiles(files);
    setBatchResults([]);
  };

  // Process batch of images
  const handleBatchProcess = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No images selected",
        description: "Please select at least one image to process",
        variant: "destructive"
      });
      return;
    }

    if (!prompt.trim()) {
      toast({
        title: "No prompt provided",
        description: "Please enter a prompt describing how to edit the images",
        variant: "destructive"
      });
      return;
    }

    setIsBatchProcessing(true);
    setBatchResults([]);

    // Define the progress callback function
    const handleProgressUpdate = (index: number, status: BatchImageResult['status'], result?: string, errorMsg?: string) => {
      setBatchResults(prev => {
        const updated = [...prev];
        if (!updated[index]) {
          // Initialize if not exists
          updated[index] = {
            originalImage: URL.createObjectURL(selectedFiles[index]),
            editedImage: null,
            status: 'pending',
            fileName: selectedFiles[index].name
          };
        }
        
        updated[index].status = status;
        
        if (status === 'completed' && result) {
          updated[index].editedImage = result;
        }
        
        if (status === 'error' && errorMsg) {
          updated[index].error = errorMsg;
        }
        
        return updated;
      });
    };

    try {
      // Process all images with the service function
      const results = await processBatchImageEdits(selectedFiles, prompt, handleProgressUpdate, category, platform);

      // Final update with all results
      setBatchResults(results);
      
      // Show success toast
      const successCount = results.filter(r => r.status === 'completed').length;
      toast({
        title: `Processed ${successCount} of ${results.length} images`,
        description: successCount === results.length 
          ? "All images were successfully processed" 
          : `${results.length - successCount} images failed to process`,
        variant: successCount === results.length ? "default" : "destructive"
      });
    } catch (error) {
      console.error("Batch processing error:", error);
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
      <div className="container mx-auto py-6 space-y-6">
        <Tabs defaultValue="single" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Image</TabsTrigger>
            <TabsTrigger value="batch">Batch Processing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single" className="mt-4">
            {/* Local state for single image mode */}
            {(() => {
              // Local responseText state only used in this tab
              const [responseText, setResponseText] = useState<string | null>(null);
              
              // Update handleSubmit to use the local responseText state
              const handleSingleSubmit = async (e: React.FormEvent) => {
                e.preventDefault();
                
                // Clear any previous errors when user takes a new action
                setError(null);
                
                if (!selectedImage || !prompt) {
                  setError("Please select an image and enter a prompt");
                  return;
                }
                
                console.log(`Submitting image edit request with prompt: "${prompt}"`);
                setIsLoading(true);
                
                // Process the image edit using the service function
                const result = await processSingleImageEdit(selectedImage, prompt, category, platform);
                
                if (result.image) {
                  setGeneratedImage(result.image);
                  setResponseText(null);
                  
                  toast({
                    title: "Image Edited Successfully",
                    description: "Your image has been processed with AI",
                  });
                } else if (result.error) {
                  setError(result.error);
                  
                  toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive",
                  });
                }
                
                setIsLoading(false);
              };
              
              return (
                <div className="space-y-4">
                  {/* Platform and Category Selector */}
                  <PromptTemplateSelector
                    platform={platform}
                    setPlatform={setPlatform}
                    category={category}
                    setCategory={setCategory}
                  />
                  
                  <Card className="shadow-md">
                    <CardHeader>
                      <CardTitle>Image Editor</CardTitle>
                      <CardDescription>
                        Transform your product images with AI-powered editing
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                <form onSubmit={handleSingleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="image-upload">Upload Image</Label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept=".jpeg,.jpg,.png"
                      onChange={handleImageChange}
                      className="bg-background"
                    />
                    <Alert variant="default" className="bg-muted/50 border-muted">
                      <InfoIcon className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Only JPEG or PNG files are supported (max 5MB).
                      </AlertDescription>
                    </Alert>
                  </div>

                  {selectedImage && (
                    <div className="mt-4 rounded-md overflow-hidden border">
                      <img 
                        src={selectedImage} 
                        alt="Preview" 
                        className="w-full h-auto object-contain max-h-[300px]" 
                      />
                    </div>
                  )}

                  {error && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="prompt" className="text-lg font-medium">Edit Instructions</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8">
                            <Lightbulb className="h-3.5 w-3.5 mr-2" />
                            Example Prompts
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent side="bottom" align="end" className="w-80">
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Example Prompts</h4>
                            <p className="text-xs text-muted-foreground">Click to use these example prompts</p>
                          </div>
                          <ExamplePromptLibrary onSelectPrompt={setPrompt} />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Textarea
                      id="prompt"
                      placeholder="Describe how you want to edit the image..."
                      className="min-h-[80px]"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || !selectedImage || !prompt.trim()}
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
                </form>

                {(generatedImage || responseText) && (
                  <div className="mt-8 space-y-6">
                    {generatedImage && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-lg font-medium">Generated Image</Label>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                            const link = document.createElement('a');
                            link.href = generatedImage;
                            link.download = `edited-image-${Date.now()}.png`;
                            link.click();
                          }}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="rounded-md overflow-hidden border">
                          <img
                            src={generatedImage}
                            alt="Generated Result"
                            className="w-full h-auto object-contain max-h-[300px]"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground italic mt-1">
                        ⚠️ The Gemini model currently supports limited image dimensions. Improvements are ongoing to achieve higher resolution and quality outputs. Please optimize your images by resizing them before uploading to the system if possible.
                        </p>
                      </div>
                    )}
                    
                    {responseText && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-lg font-medium">AI Comments</Label>
                        </div>
                        <div className="rounded-md border p-4 bg-muted/20">
                          <p className="whitespace-pre-wrap text-sm">{responseText}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
                  </Card>
                </div>
              );
            })()}
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
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="batch-prompt" className="text-lg font-medium">Edit Instructions</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8">
                              <Lightbulb className="h-3.5 w-3.5 mr-2" />
                              Example Prompts
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent side="bottom" align="end" className="w-80">
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm">Example Prompts</h4>
                              <p className="text-xs text-muted-foreground">Click to use these example prompts</p>
                            </div>
                            <ExamplePromptLibrary onSelectPrompt={setPrompt} />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <Textarea
                        id="batch-prompt"
                        placeholder="Apply the same edit to all images..."
                        className="min-h-[80px]"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={isBatchProcessing}
                      />
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={handleBatchProcess} 
                      disabled={isBatchProcessing || selectedFiles.length === 0 || !prompt.trim()}
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
                  </div>
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
    </DashboardLayout>
  );
};

export default EditProductImage;
