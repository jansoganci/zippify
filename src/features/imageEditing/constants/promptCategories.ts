export type PromptCategory = {
  name: string;
  prompts: Array<{
    label: string;
    text: string;
    description?: string;
  }>;
};

const promptCategories: PromptCategory[] = [
  {
    name: "Background",
    prompts: [
      {
        label: "Blur Background",
        text: "Please blur the background to emphasize the main subject.",
        description: "Creates a smooth bokeh effect."
      },
      {
        label: "Remove Background",
        text: "Remove the entire background and make it transparent.",
        description: "Useful for isolating objects."
      },
      {
        label: "Replace Background",
        text: "Replace the background with a solid white background.",
        description: "Ideal for product photos."
      }
    ]
  },
  {
    name: "Lighting",
    prompts: [
      {
        label: "Enhance Lighting",
        text: "Adjust the lighting to make the image brighter and more vibrant."
      },
      {
        label: "Add Soft Light",
        text: "Add a soft, diffused light effect to reduce harsh shadows."
      },
      {
        label: "Warm Tone",
        text: "Apply a warm tone to the lighting to create a cozy atmosphere."
      }
    ]
  },
  {
    name: "Sharpen",
    prompts: [
      {
        label: "Increase Sharpness",
        text: "Sharpen the image to enhance details and clarity."
      },
      {
        label: "Edge Sharpen",
        text: "Apply an edge sharpen filter to define contours."
      },
      {
        label: "Detail Enhancement",
        text: "Enhance fine details without introducing noise."
      }
    ]
  },
  {
    name: "Cleanup",
    prompts: [
      {
        label: "Remove Blemishes",
        text: "Clean up blemishes and imperfections on the surface."
      },
      {
        label: "Dust and Scratch Removal",
        text: "Remove dust spots and scratches for a cleaner look."
      },
      {
        label: "Noise Reduction",
        text: "Reduce image noise while preserving detail."
      },
      {
        label: "Clone Stamp Cleanup",
        text: "Use clone stamp technique to clean up unwanted elements."
      }
    ]
  }
];

export default promptCategories;
