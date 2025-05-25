import { etsyRules } from "@/platformRules/etsyRules";
import { DEFAULT_AI_PROVIDER } from '@/config/ai';
import { createLogger } from '@/utils/logger';

// Create logger for this service
const logger = createLogger('generateTitle');

/**
 * Generates an optimized Etsy title based on user input and platform rules.
 * @param productDescription - Detailed product info (materials, use case, features, etc.)
 * @param targetKeywords - Primary keywords to be included in the title
 * @param provider - AI provider to use for title generation
 * @returns Generated title as a string
 */
export async function generateTitle({
  productDescription,
  targetKeywords,
  provider,
}: {
  productDescription: string;
  targetKeywords: string[];
  provider?: string;
}): Promise<any> {
  const systemPrompt = etsyRules.title.fullPrompt;

  const finalPrompt = systemPrompt
    .replace("[productDescription]", productDescription)
    .replace("[targetKeywords]", targetKeywords.join(", "));

  // JWT token'ı localStorage'dan al
  const token = localStorage.getItem('zippify_token');

  // Return AI call structure (adjust model/provider if needed)
  const aiProvider = provider || DEFAULT_AI_PROVIDER;
  
  try {
    // Production'da VITE_API_URL undefined olabilir, bu durumda fallback olarak 'https://listify.digital' kullan
    let baseUrl = import.meta.env.VITE_API_URL || 'https://listify.digital';
    
    // Eğer baseUrl /api ile bitmiyorsa, /api ekle
    if (!baseUrl.endsWith('/api')) {
      baseUrl = baseUrl.endsWith('/') ? `${baseUrl}api` : `${baseUrl}/api`;
    }
    
    logger.debug('Requesting title generation', { provider: aiProvider, keywordCount: targetKeywords.length });
    
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
      logger.error(`HTTP error during title generation`, { 
        status: response.status, 
        statusText: response.statusText 
      });
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    logger.info('Title generated successfully');
    
    return data;
  } catch (error) {
    logger.error('Failed to generate title', { 
      error: error.message,
      provider: aiProvider 
    });
    throw error;
  }
}
