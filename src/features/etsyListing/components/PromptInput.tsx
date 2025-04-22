import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface PromptInputProps {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
}

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt }) => {
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  return (
    <div className="w-full mb-4">
      <div className="relative">
        <Textarea
          aria-label="Product Description"
          id="product-description"
          value={prompt}
          onChange={handlePromptChange}
          className={cn(
            "min-h-[150px] resize-y w-full px-3 py-2 bg-background text-foreground",
            "border-input focus:border-ring focus-visible:ring-ring",
            "placeholder:text-muted-foreground"
          )}
          placeholder="Enter your product description here..."
        />
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
          {prompt.length} characters
        </div>
      </div>
    </div>
  );
};

export default PromptInput;
