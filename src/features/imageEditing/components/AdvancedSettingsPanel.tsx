import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, RotateCcw } from "lucide-react";

// Define the type for advanced settings options
export interface AdvancedSettingsOptions {
  temperature: number;
  topP: number;
  topK: number;
  seed?: number | null;
  outputFormat: "jpeg" | "png" | "webp";
  outputWidth: number;
  outputHeight: number;
  outputQuality: number;
}

// Default values for the settings
const defaultSettings: AdvancedSettingsOptions = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  seed: null,
  outputFormat: "jpeg",
  outputWidth: 1200,
  outputHeight: 1200,
  outputQuality: 90,
};

interface AdvancedSettingsPanelProps {
  value: AdvancedSettingsOptions;
  onChange: (options: AdvancedSettingsOptions) => void;
}

const AdvancedSettingsPanel: React.FC<AdvancedSettingsPanelProps> = ({
  value,
  onChange,
}) => {
  // Local state to track if the panel is open
  const [isOpen, setIsOpen] = useState(false);

  // Handle reset to defaults
  const handleReset = () => {
    onChange({ ...defaultSettings });
  };

  // Handle changes to individual settings
  const handleChange = (
    key: keyof AdvancedSettingsOptions,
    newValue: any
  ) => {
    onChange({
      ...value,
      [key]: newValue,
    });
  };

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full border rounded-lg"
      value={isOpen ? "advanced-settings" : ""}
      onValueChange={(val) => setIsOpen(val === "advanced-settings")}
    >
      <AccordionItem value="advanced-settings" className="border-none">
        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
          <div className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            <span className="font-medium">Advanced Settings</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="flex items-center"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Reset to Default
              </Button>
            </div>

            {/* Generation Parameters Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Generation Parameters
              </h3>

              {/* Temperature */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="temperature" className="text-xs">
                    Temperature: {value.temperature.toFixed(1)}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Slider
                    id="temperature"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[value.temperature]}
                    onValueChange={(vals) =>
                      handleChange("temperature", vals[0])
                    }
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Controls randomness: lower values are more deterministic, higher values more creative.
                </p>
              </div>

              {/* Top P */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="topP" className="text-xs">
                    Top P: {value.topP.toFixed(1)}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Slider
                    id="topP"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[value.topP]}
                    onValueChange={(vals) => handleChange("topP", vals[0])}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Controls diversity via nucleus sampling: 0.9 means consider the top 90% probable tokens.
                </p>
              </div>

              {/* Top K */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="topK" className="text-xs">
                    Top K: {value.topK}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Slider
                    id="topK"
                    min={1}
                    max={100}
                    step={1}
                    value={[value.topK]}
                    onValueChange={(vals) => handleChange("topK", vals[0])}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Limits token selection to the top K most likely tokens.
                </p>
              </div>

              {/* Seed */}
              <div className="space-y-2">
                <Label htmlFor="seed" className="text-xs">
                  Seed (Optional)
                </Label>
                <Input
                  id="seed"
                  type="number"
                  placeholder="Random seed"
                  value={value.seed !== null ? value.seed : ""}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    handleChange(
                      "seed",
                      val === "" ? null : parseInt(val, 10)
                    );
                  }}
                  className="h-9"
                />
                <p className="text-xs text-muted-foreground">
                  Set a specific seed for reproducible results. Leave empty for random results.
                </p>
              </div>
            </div>

            {/* Output Format Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Output Format
              </h3>

              {/* Format */}
              <div className="space-y-2">
                <Label htmlFor="outputFormat" className="text-xs">
                  Format
                </Label>
                <Select
                  value={value.outputFormat}
                  onValueChange={(val) =>
                    handleChange(
                      "outputFormat",
                      val as "jpeg" | "png" | "webp"
                    )
                  }
                >
                  <SelectTrigger id="outputFormat" className="h-9">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="webp">WebP</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Image format for the generated output.
                </p>
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="outputWidth" className="text-xs">
                    Width
                  </Label>
                  <Input
                    id="outputWidth"
                    type="number"
                    min={100}
                    max={4000}
                    value={value.outputWidth}
                    onChange={(e) =>
                      handleChange("outputWidth", parseInt(e.target.value, 10))
                    }
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="outputHeight" className="text-xs">
                    Height
                  </Label>
                  <Input
                    id="outputHeight"
                    type="number"
                    min={100}
                    max={4000}
                    value={value.outputHeight}
                    onChange={(e) =>
                      handleChange("outputHeight", parseInt(e.target.value, 10))
                    }
                    className="h-9"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Output dimensions in pixels. Higher values may increase processing time.
              </p>

              {/* Quality */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="outputQuality" className="text-xs">
                    Quality: {value.outputQuality}%
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Slider
                    id="outputQuality"
                    min={10}
                    max={100}
                    step={5}
                    value={[value.outputQuality]}
                    onValueChange={(vals) =>
                      handleChange("outputQuality", vals[0])
                    }
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Output image quality. Higher values produce better quality but larger file sizes.
                </p>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default AdvancedSettingsPanel;
