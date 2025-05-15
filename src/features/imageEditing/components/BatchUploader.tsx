import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BatchUploaderProps {
  onImagesSelected: (images: File[]) => void;
  isProcessing: boolean;
}

const BatchUploader: React.FC<BatchUploaderProps> = ({ onImagesSelected, isProcessing }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      
      // Validate file types and sizes
      const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
      const largeFiles = files.filter(file => file.size > 5 * 1024 * 1024); // 5MB limit
      
      if (invalidFiles.length > 0) {
        setError(`${invalidFiles.length} file(s) are not images. Please select only image files.`);
        return;
      }
      
      if (largeFiles.length > 0) {
        setError(`${largeFiles.length} file(s) exceed the 5MB size limit.`);
        return;
      }
      
      // Limit to 10 images at a time
      if (files.length > 10) {
        setError("You can only upload up to 10 images at a time.");
        return;
      }
      
      setSelectedFiles(files);
      onImagesSelected(files);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    onImagesSelected(newFiles);
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
    onImagesSelected([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer" onClick={handleBrowseClick}>
            <Upload className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 font-medium">Click to upload multiple images</p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG or WEBP (Max 10 files, 5MB each)</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isProcessing}
            />
          </div>

          {error && (
            <Alert variant="destructive" className="border-red-300 bg-red-50">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {selectedFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-medium">{selectedFiles.length} Images Selected</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearAll}
                  disabled={isProcessing}
                >
                  Clear All
                </Button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-md overflow-hidden border bg-gray-100 flex items-center justify-center">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Selected ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <button
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveFile(index)}
                      disabled={isProcessing}
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <p className="text-xs text-gray-500 truncate mt-1">{file.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BatchUploader;

