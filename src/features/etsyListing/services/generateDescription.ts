import { etsyRules } from "@/platformRules/etsyRules";
import { DEFAULT_AI_PROVIDER } from '@/config/ai';
import { createLogger } from '@/utils/logger';

// Create logger for this service
const logger = createLogger('generateDescription');

/**
 * Generates an optimized Etsy description based on user input and platform rules.
 * @param options - Object containing input parameters
 * @param options.promptInput - The input prompt containing product information
 * @param options.selectedKeywords - Array of keywords to incorporate in the description
 * @param options.productType - The type of product (digital or physical)
 * @param options.productDimensions - The dimensions of the product
 * @param options.provider - AI provider to use (optional)
 * @returns Generated description response
 */
export async function generateDescription({
  promptInput,
  selectedKeywords = [],
  productType = "physical",
  productDimensions = "",
  provider,
}: {
  promptInput: string;
  selectedKeywords?: string[];
  productType?: "digital" | "physical";
  productDimensions?: string;
  provider?: string;
}): Promise<any> {
  const systemPrompt = etsyRules.description.fullPrompt;

  const digitalDisclaimer = productType === "digital" ? "yes" : "no";

  // Format keywords as a comma-separated string if present
  const keywordsText = selectedKeywords.length > 0 
    ? selectedKeywords.join(", ") 
    : "";

  const finalPrompt = systemPrompt
    .replace("[productName]", promptInput)
    .replace("[productDetails]", promptInput)
    .replace("[targetAudience]", "Etsy shoppers")
    .replace("[keywords]", keywordsText)
    .replace("[tone]", "warm and conversational")
    .replace("[length]", "medium")
    .replace("[format]", "paragraphs with bullet points")
    .replace("[callToAction]", "yes")
    .replace("[digitalDisclaimer]", digitalDisclaimer)
    .replace("[productType]", productType)
    .replace("[productDimensions]", productDimensions);

  // JWT token'ı localStorage'dan al
  const token = localStorage.getItem('zippify_token');

  // Return AI call structure (adjust model/provider if needed)
  const aiProvider = provider || DEFAULT_AI_PROVIDER;
  // Production'da VITE_API_URL undefined olabilir, bu durumda fallback olarak 'https://listify.digital' kullan
  let baseUrl = import.meta.env.VITE_API_URL || 'https://listify.digital';
  
  // Eğer baseUrl /api ile bitmiyorsa, /api ekle
  if (!baseUrl.endsWith('/api')) {
    baseUrl = baseUrl.endsWith('/') ? `${baseUrl}api` : `${baseUrl}/api`;
  }
  
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
    logger.error('HTTP error during description generation', { 
      status: response.status, 
      statusText: response.statusText 
    });
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  
  const data = await response.json();
  logger.info('Description generated successfully');
  
  return data;
}
