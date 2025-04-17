import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Download, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface BatchImageResult {
  originalImage: string;
  editedImage: string | null;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
  fileName: string;
}

interface BatchResultsProps {
  results: BatchImageResult[];
  isProcessing: boolean;
}

const BatchResults: React.FC<BatchResultsProps> = ({ results, isProcessing }) => {
  if (results.length === 0) {
    return null;
  }

  const handleDownload = (imageUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `edited-${fileName}`;
    link.click();
  };

  const handleDownloadAll = () => {
    // Only download completed images
    const completedResults = results.filter(result => result.status === 'completed' && result.editedImage);
    
    completedResults.forEach(result => {
      if (result.editedImage) {
        setTimeout(() => {
          handleDownload(result.editedImage!, result.fileName);
        }, 300); // Small delay between downloads to prevent browser issues
      }
    });
  };

  const completedCount = results.filter(result => result.status === 'completed').length;
  const errorCount = results.filter(result => result.status === 'error').length;

  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <Label className="text-lg font-medium">Results ({completedCount}/{results.length} Completed)</Label>
          {completedCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadAll}
              disabled={isProcessing}
            >
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
          )}
        </div>

        {errorCount > 0 && (
          <Alert variant="destructive" className="border-red-300 bg-red-50 mb-4">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription className="text-sm">
              {errorCount} image(s) failed to process. You can try again with those images.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((result, index) => (
            <div key={index} className="border rounded-md p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium truncate">{result.fileName}</p>
                {result.status === 'completed' && result.editedImage && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => handleDownload(result.editedImage!, result.fileName)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Original Image */}
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Original</Label>
                  <div className="aspect-square rounded-md overflow-hidden border bg-gray-100">
                    <img
                      src={result.originalImage}
                      alt="Original"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                
                {/* Edited Image or Loading State */}
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Edited</Label>
                  <div className="aspect-square rounded-md overflow-hidden border bg-gray-100 flex items-center justify-center">
                    {result.status === 'pending' && (
                      <div className="text-xs text-gray-500">Waiting...</div>
                    )}
                    
                    {result.status === 'processing' && (
                      <div className="flex flex-col items-center justify-center">
                        <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                        <span className="text-xs text-gray-500 mt-2">Processing...</span>
                      </div>
                    )}
                    
                    {result.status === 'completed' && result.editedImage && (
                      <img
                        src={result.editedImage}
                        alt="Edited"
                        className="w-full h-full object-contain"
                      />
                    )}
                    
                    {result.status === 'error' && (
                      <div className="flex flex-col items-center justify-center p-4 text-center">
                        <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
                        <span className="text-xs text-red-500">
                          {result.error || "Failed to process image"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BatchResults;
