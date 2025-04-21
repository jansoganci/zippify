import { etsyRules } from "@/platformRules/etsyRules";

/**
 * Generates SEO-optimized alt text for Etsy product images based on user input and platform rules.
 * @param promptInput - The input prompt containing product information
 * @param selectedKeywords - Array of keywords to incorporate in the alt text
 * @returns Generated alt text response
 */
export async function generateAltText(promptInput: string, selectedKeywords: string[] = []): Promise<any> {
  const systemPrompt = etsyRules.altText.fullPrompt;

  try {
    // Format keywords as a comma-separated string if present
    const keywordsText = selectedKeywords.length > 0 
      ? selectedKeywords.join(", ") 
      : "";

    const finalPrompt = systemPrompt
      .replace("[productName]", promptInput)
      .replace("[productDescription]", promptInput)
      .replace("[targetAudience]", "Etsy shoppers")
      .replace("[keywords]", keywordsText)
      .replace("[image1]", "Product image 1")
      .replace("[image2]", "Product image 2")
      .replace("[image3]", "Product image 3");

  // JWT token'ı localStorage'dan al
  const token = localStorage.getItem('zippify_token');

  // Return AI call structure (adjust model/provider if needed)
  const response = await fetch(import.meta.env.VITE_DEEPSEEK_ENDPOINT, {
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
    console.error("[generateAltText] Error:", error);
    return { content: "" };
  }
}
