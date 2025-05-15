import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import promptCategories from "../constants/promptCategories";

export interface ExamplePromptLibraryProps {
  onSelectPrompt: (promptText: string) => void;
  className?: string;
}

const ExamplePromptLibrary: React.FC<ExamplePromptLibraryProps> = ({ onSelectPrompt, className }) => {
  const defaultTab = promptCategories[0]?.name;

  return (
    <div className={className}>
      <Tabs defaultValue={defaultTab}>
        <TabsList className="flex-wrap gap-x-2 overflow-x-auto">
          {promptCategories.map((category) => (
            <TabsTrigger
              key={category.name}
              value={category.name}
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {promptCategories.map((category) => (
          <TabsContent key={category.name} value={category.name}>
            <div className="flex flex-col gap-2 mt-2 px-2">
              {category.prompts.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  className="flex flex-col items-start w-full p-3 border rounded-md transition-colors duration-200 ease-in-out hover:bg-muted hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={() => onSelectPrompt(p.text)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">✨</span>
                    <span className="font-medium text-sm">{p.label}</span>
                  </div>
                  {p.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {p.description}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ExamplePromptLibrary;

