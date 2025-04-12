import React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Lightbulb, Plus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SamplePromptListProps {
  onPromptSelect: (prompt: string) => void;
}

interface PromptSuggestion {
  prompt: string;
  tip: string;
}

const SamplePromptList: React.FC<SamplePromptListProps> = ({ onPromptSelect }) => {
  // Sample prompts with tips
  const samplePrompts: PromptSuggestion[] = [
    {
      prompt: "A handcrafted {product} made from premium {material}, designed to bring warmth and beauty to {occasion} moments. Ideal for {audience} who appreciate {style} details.",
      tip: "Combines sensory appeal, purpose, and target audience. Great for emotional and visual impact."
    },
    {
      prompt: "A personalized {product} with custom {feature} (e.g., name, date, or symbol), perfect as a thoughtful {occasion} gift that tells a story.",
      tip: "Encourages meaningful personalization and emotional connection with buyers."
    },
    {
      prompt: "Elevate your {space} with this unique {product} that combines {style} aesthetics with practical functionality. Each piece is {process} to ensure exceptional quality.",
      tip: "Focuses on both decorative and functional benefits, appealing to practical buyers."
    },
    {
      prompt: "This {product} features intricate {technique} details that showcase traditional craftsmanship. Each {feature} is carefully {process} to create a one-of-a-kind piece.",
      tip: "Highlights craftsmanship and uniqueness, perfect for artisanal products."
    },
    {
      prompt: "A versatile {product} that transitions seamlessly from {occasion} to everyday use. The {material} construction ensures durability while the {feature} adds a distinctive touch.",
      tip: "Emphasizes versatility and practical value, appealing to value-conscious shoppers."
    }
  ];

  return (
    <div className="flex items-center justify-end">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 flex items-center gap-1 text-xs">
            <Lightbulb className="h-3.5 w-3.5" />
            Prompt Suggestions
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[600px] p-3">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Sample Prompts</h4>
            <p className="text-xs text-muted-foreground">
              Click 'Use' to insert a prompt. Replace placeholders like {"{product}"} with your specific details.
            </p>
            <div className="space-y-2 mt-2">
              {samplePrompts.map((suggestion, index) => (
                <div key={index} className="flex items-center justify-between rounded-md border p-2 text-sm">
                  <div className="flex flex-col flex-1 mr-2">
                    <span className="text-xs line-clamp-2">{suggestion.prompt}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-[10px] text-muted-foreground mt-1 italic cursor-help">
                            Why this works
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs max-w-xs">{suggestion.tip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 ml-2 flex-shrink-0" 
                    onClick={() => onPromptSelect(suggestion.prompt)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SamplePromptList;
