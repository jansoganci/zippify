import { etsyRules } from "@/platformRules/etsyRules";

/**
 * Generates SEO-optimized alt text for Etsy product images based on user input and platform rules.
 * @param promptInput - The input prompt containing product information
 * @returns Generated alt text response
 */
export async function generateAltText(promptInput: string): Promise<any> {
  const systemPrompt = etsyRules.altText.fullPrompt;

  const finalPrompt = systemPrompt
    .replace("[productName]", promptInput)
    .replace("[productDescription]", promptInput)
    .replace("[targetAudience]", "Etsy shoppers")
    .replace("[keywords]", "")
    .replace("[image1]", "Product image 1")
    .replace("[image2]", "Product image 2")
    .replace("[image3]", "Product image 3");

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
}
