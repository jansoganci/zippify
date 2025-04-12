import { etsyRules } from "@/platformRules/etsyRules";

/**
 * Generates an optimized Etsy title based on user input and platform rules.
 * @param productDescription - Detailed product info (materials, use case, features, etc.)
 * @param targetKeywords - Primary keywords to be included in the title
 * @returns Generated title as a string
 */
export async function generateTitle({
  productDescription,
  targetKeywords,
}: {
  productDescription: string;
  targetKeywords: string[];
}): Promise<any> {
  const systemPrompt = etsyRules.title.fullPrompt;

  const finalPrompt = systemPrompt
    .replace("[productDescription]", productDescription)
    .replace("[targetKeywords]", targetKeywords.join(", "));

  // Return AI call structure (adjust model/provider if needed)
  const response = await fetch("/api/deepseek", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system: systemPrompt,
      prompt: finalPrompt,
    }),
  });

  const data = await response.json();
  return data;
}
