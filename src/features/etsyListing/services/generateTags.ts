import { etsyRules } from "@/platformRules/etsyRules";

/**
 * Generates optimized Etsy tags based on user input and platform rules.
 * @param promptInput - The input prompt containing product information
 * @param selectedKeywords - Array of keywords to incorporate in the tags
 * @returns Generated tags response as a string array (e.g., ["tag 1", "tag 2", ..., "tag 13"])
 */
export async function generateTags(promptInput: string, selectedKeywords: string[] = []): Promise<any> {
  const systemPrompt = etsyRules.tags.fullPrompt;

  try {
    // Format keywords as a comma-separated string if present
    const keywordsText = selectedKeywords.length > 0 
      ? selectedKeywords.join(", ") 
      : "";

    const finalPrompt = systemPrompt
      .replace("[productName]", promptInput)
      .replace("[productDescription]", promptInput)
      .replace("[targetAudience]", "Etsy shoppers")
      .replace("[broadAndSpecificKeywords]", keywordsText)
      .replace("[category]", "")
      .replace("[attributes]", "");

  // JWT token'ı localStorage'dan al
  const token = localStorage.getItem('zippify_token');

  // Return AI call structure (adjust model/provider if needed)
  const response = await fetch("/api/deepseek", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify({
      system: systemPrompt,
      prompt: finalPrompt,
      featureKey: "create-listing"
    }),
  });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[generateTags] Error:", error);
    return { content: "" };
  }
}
