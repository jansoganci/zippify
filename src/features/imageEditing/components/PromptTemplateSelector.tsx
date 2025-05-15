import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface PromptTemplateSelectorProps {
  platform: string;
  setPlatform: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
}

const PromptTemplateSelector: React.FC<PromptTemplateSelectorProps> = ({
  platform,
  setPlatform,
  category,
  setCategory,
}) => {
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="platform-select">Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger id="platform-select">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="etsy">Etsy</SelectItem>
                <SelectItem value="amazon">Amazon</SelectItem>
                <SelectItem value="ebay">eBay</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category-select">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category-select">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jewelry">Jewelry</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="decor">Decor</SelectItem>
                <SelectItem value="art">Art</SelectItem>
                <SelectItem value="crafts">Crafts</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromptTemplateSelector;

