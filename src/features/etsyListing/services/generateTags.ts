import { etsyRules } from "@/platformRules/etsyRules";
import { DEFAULT_AI_PROVIDER } from '@/config/ai';

/**
 * Generates optimized Etsy tags based on user input and platform rules.
 * @param promptInput - The input prompt containing product information
 * @param selectedKeywords - Array of keywords to incorporate in the tags
 * @param provider - Optional AI provider parameter, defaults to central config
 * @returns Generated tags response as a string array (e.g., ["tag 1", "tag 2", ..., "tag 13"])
 */
export async function generateTags(promptInput: string, selectedKeywords: string[] = [], provider?: string): Promise<any> {
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
  const aiProvider = provider || DEFAULT_AI_PROVIDER;
  // Production'da VITE_API_URL undefined olabilir, bu durumda fallback olarak 'https://listify.digital' kullan
  const baseUrl = import.meta.env.VITE_API_URL || 'https://listify.digital';
  const response = await fetch(`${baseUrl}/ai/${aiProvider}`, {
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

    if (!response.ok) {
      // HTTP hata durumlarını işle
      if (import.meta.env.MODE !== 'production') {
        console.error(`❌ [generateTags] HTTP Error: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error(`❌ [generateTags] Error details:`, errorText);
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (import.meta.env.MODE !== 'production') {
      console.log(`✅ [generateTags] API Response:`, {
        content: data?.content?.substring(0, 50) + '...',
        status: 'success'
      });
    }
    
    return data;
  } catch (error) {
    if (import.meta.env.MODE !== 'production') {
      console.error(`❌ [generateTags] Fetch Error:`, error);
      console.error(`❌ [generateTags] Error details:`, {
        message: error.message,
        stack: error.stack
      });
    }
    throw error; // Hata fırlatımını devam ettir
  }
}
