import { etsyRules } from "@/platformRules/etsyRules";
import { DEFAULT_AI_PROVIDER } from '@/config/ai';

/**
 * Generates SEO-optimized alt text for Etsy product images based on user input and platform rules.
 * @param promptInput - The input prompt containing product information
 * @param selectedKeywords - Array of keywords to incorporate in the alt text
 * @param provider - Optional AI provider parameter, defaults to central config
 * @returns Generated alt text response
 */
export async function generateAltText(promptInput: string, selectedKeywords: string[] = [], provider?: string): Promise<any> {
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
  const aiProvider = provider || DEFAULT_AI_PROVIDER;
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/${aiProvider}`, {
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
    
    // API yanıtını işleyerek sadece alt metin kısmını döndür
    if (data && data.content) {
      const content = data.content;
      let altTexts = '';
      
      // Regex ile sadece "Image X:" ile başlayan satırları bul
      const imageRegex = /Image \d+[:\(][^\n]+/g;
      const imageMatches = content.match(imageRegex);
      
      if (imageMatches && imageMatches.length > 0) {
        // Sadece alt metinleri içeren satırları al
        altTexts = imageMatches.join('\n');
        
        if (import.meta.env.MODE !== 'production') {
          console.log('🟢 [generateAltText] Successfully extracted alt texts with regex');
        }
        
        // Açıklama metinlerini temizle
        altTexts = altTexts
          .replace(/Here['']s optimized alt text[^\n]+/g, '')
          .replace(/Each alt text[^\n]+/g, '')
          .replace(/Let me know[^\n]+/g, '')
          .replace(/\n\n+/g, '\n')
          .trim();
        
        return { content: altTexts };
      }
      
      // "Alt Text for Images" bölümünü bul
      if (content.includes('Alt Text for Images')) {
        const altTextSection = content.split('Alt Text for Images')[1];
        
        // Sadece Image 1:, Image 2: gibi satırları al
        const lines = altTextSection.split('\n');
        const imageLines = lines.filter(line => 
          /Image \d+:/.test(line) && line.trim().length > 0
        );
        
        if (imageLines.length > 0) {
          altTexts = imageLines.join('\n');
          
          if (import.meta.env.MODE !== 'production') {
            console.log('🟢 [generateAltText] Successfully extracted alt texts from section');
          }
          
          return { content: altTexts };
        }
      }
      
      // Son çare: Sadece "Image" kelimesi içeren satırları bul
      const lines = content.split('\n');
      const imageLines = lines.filter(line => 
        line.includes('Image') && 
        !line.includes('Here') && 
        !line.includes('Each alt text') &&
        !line.includes('Let me know')
      );
      
      if (imageLines.length > 0) {
        altTexts = imageLines.join('\n');
        
        if (import.meta.env.MODE !== 'production') {
          console.log('🟢 [generateAltText] Found image lines as fallback');
        }
        
        return { content: altTexts };
      }
      
      // Alt metin bulunamazsa, tüm içeriği döndür
      if (import.meta.env.MODE !== 'production') {
        console.log('🟡 [generateAltText] Could not extract alt texts, returning full content');
      }
      
      // Son çare: Açıklama satırlarını temizle
      const cleanedContent = content
        .replace(/Here['']s optimized alt text[^\n]+/g, '')
        .replace(/Each alt text[^\n]+/g, '')
        .replace(/Let me know[^\n]+/g, '')
        .replace(/\n\n+/g, '\n')
        .trim();
      
      return { content: cleanedContent };
    }
    
    return data;
  } catch (error) {
    console.error("[generateAltText] Error:", error);
    return { content: "" };
  }
}
