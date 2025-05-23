import { etsyRules } from "@/platformRules/etsyRules";
import { DEFAULT_AI_PROVIDER } from '@/config/ai';

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
  
  // Geliştirme ortamında daha detaylı loglama
  if (import.meta.env.MODE !== 'production') {
    console.log(`📡 [generateTitle] API Request to: ${import.meta.env.VITE_API_URL}/ai/${aiProvider}`);
    console.log(`📡 [generateTitle] Token present: ${!!token}`);
    console.log(`📡 [generateTitle] Request payload:`, {
      system: systemPrompt.substring(0, 50) + '...',
      prompt: finalPrompt.substring(0, 50) + '...',
      featureKey: "create-listing"
    });
  }
  
  try {
    // Production'da VITE_API_URL undefined olabilir, bu durumda fallback olarak 'https://listify.digital' kullan
    let baseUrl = import.meta.env.VITE_API_URL || 'https://listify.digital';
    
    // Eğer baseUrl zaten /api ile bitmiyorsa ve production'da değilsek, /api ekle
    if (!baseUrl.endsWith('/api') && !import.meta.env.PROD) {
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
      // HTTP hata durumlarını işle
      if (import.meta.env.MODE !== 'production') {
        console.error(`❌ [generateTitle] HTTP Error: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error(`❌ [generateTitle] Error details:`, errorText);
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (import.meta.env.MODE !== 'production') {
      console.log(`✅ [generateTitle] API Response:`, {
        content: data?.content?.substring(0, 50) + '...',
        status: 'success'
      });
    }
    
    return data;
  } catch (error) {
    if (import.meta.env.MODE !== 'production') {
      console.error(`❌ [generateTitle] Fetch Error:`, error);
      console.error(`❌ [generateTitle] Error details:`, {
        message: error.message,
        stack: error.stack
      });
    }
    throw error; // Hata fırlatımını devam ettir
  }
}
