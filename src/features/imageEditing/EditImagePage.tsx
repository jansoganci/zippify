
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, Download, AlertTriangle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const EditProductImage = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
    
    try {
      console.log("Sending request to backend API...");
      const requestStartTime = Date.now();
      
      const response = await fetch("http://localhost:3001/api/edit-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: selectedImage,
          prompt: prompt
        }),
      });
      
      const requestDuration = Date.now() - requestStartTime;
      console.log(`Received response from backend after ${requestDuration}ms with status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error (${response.status}):`, errorText);
        throw new Error(`Server responded with status ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Parsed API response:", { 
        success: data.success, 
        message: data.message,
        requestId: data.requestId,
        hasResult: !!data.result
      });
      
      if (data.success && data.result && data.result.image) {
        console.log("Successfully received generated image");
        setGeneratedImage(data.result.image);
      } else {
        console.error("API returned an invalid response:", data);
        setError("The server couldn't process your image. Please try a different image or prompt.");
      }
    } catch (error) {
      console.error("Error processing image:", error);
      setError("Something went wrong while processing your image. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Edit Product Image</h1>
          <p className="text-muted-foreground">
            Upload an image and enter a prompt. The AI will process your image accordingly.
          </p>
        </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Image Enhancement</CardTitle>
          <CardDescription>Improve your product images with AI</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="space-y-2 pt-2">
              <Label htmlFor="prompt">What would you like to do?</Label>
              <Textarea
                id="prompt"
                placeholder="Remove background"
                className="min-h-[80px]"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-300 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Processing..." : "Generate Image"}
            </Button>
          </form>

          {generatedImage && (
            <div className="mt-8 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-medium">Generated Image</Label>
                <Button variant="ghost" size="icon" className="h-8 w-8">
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
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  );
};

export default EditProductImage;