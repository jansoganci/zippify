import { makeCompletion, backendApi, getEnv } from './apiClient.js';
import { markdownToJson } from './markdownToJson.js';

/**
 * Etsy listesi oluşturmak için sistem promptu.
 * Bu prompt, DeepSeek AI'ya Etsy listesi oluşturması için talimatlar verir.
 * Çıktı formatı: title, description, tags ve altTexts alanlarını içeren bir JSON nesnesi.
 */
const SYSTEM_PROMPT = `You are an AI engine for generating high-performing Etsy listings based on a specific set of rules. Do not explain your reasoning. Only return the structured listing content as instructed below.

Follow the instructions strictly for each section:

---

**[1. Title]**
- Maximum 60 characters.
- Start with 1–2 most relevant keywords (front-load).
- Must be natural, readable, and not a keyword dump.
- Format: "[Keyword 1] [Keyword 2] - [Feature/Benefit] - [Optional Detail]"

---

**[2. Description]**
- First sentence must repeat primary keywords naturally.
- Use friendly, conversational tone.
- Include size, usage, care instructions where applicable.
- Format: short paragraphs and/or bullet points.
- Include this digital product disclaimer:
  > "Note: This is a digital download (PDF). No physical item will be shipped."
- Optional: story behind product and call-to-action.

---

**[3. Tags]**
- Generate 13 tags.
- Each tag must have **2+ words** and be under **21 characters**.
- Focus on buyer language, usage context, and product features.
- Do not use "instant download" or "crochet pattern" as tags.
- No single word should appear more than 7 times across all tags.

---

**[4. Alt Text for Images]**
- Generate 10 alt texts.
- Each alt text max 125 characters.
- Describe exactly what's in the image + how it relates to product.
- Use keywords naturally.
- All alt texts must be unique.

---

Return output in the following format (JSON-like):

\`\`\`
{
  "title": "...",
  "description": "...",
  "tags": ["...", "...", "..."],
  "altTexts": ["...", "...", "..."]
}
\`\`\`
Do not add any extra commentary. Only return the output in above format.`;

/**
 * AI tarafından oluşturulan listeyi parse eder ve yapılandırılmış bir nesne döndürür.
 * @param {Object|string} listing - AI'dan gelen ham liste yanıtı
 * @returns {Object} - Parse edilmiş liste nesnesi
 */
const parseListing = (listing) => {
  console.log(`🔍 [parseListing] Listing parse işlemi başlıyor...`);
  console.log(`🔍 [parseListing] Listing tipi: ${typeof listing}`);
  
  try {
    // Eğer listing zaten bir nesne ise
    if (typeof listing === 'object' && listing !== null) {
      console.log(`🔍 [parseListing] Listing zaten bir nesne, doğrudan işleniyor...`);
      const { title, description, tags } = listing;
      
      if (title && description && Array.isArray(tags)) {
        console.log(`✅ [parseListing] Nesne formatı geçerli, metadata ekleniyor...`);
        return {
          ...listing,
          metadata: {
            timestamp: new Date().toISOString(),
            step: 'etsy_listing'
          }
        };
      } else {
        console.warn(`⚠️ [parseListing] Nesne formatı geçersiz! Eksik alanlar var.`);
      }
    }

    // Eğer listing bir string ise  
    if (typeof listing === 'string') {
      console.log(`🔍 [parseListing] Listing bir string, işleniyor...`);
      console.log(`🔍 [parseListing] String uzunluğu: ${listing.length} karakter`);
      
      // Markdown kod bloğunu temizle
      let cleanedListing = listing.trim();
      
      // Markdown kod bloğu işaretleyicilerini kaldır (```json ve ```)
      if (cleanedListing.startsWith('```')) {
        console.log(`🔍 [parseListing] Markdown kod bloğu tespit edildi, temizleniyor...`);
        // İlk satırı kaldır (```json veya sadece ```)
        cleanedListing = cleanedListing.substring(cleanedListing.indexOf('\n') + 1);
        
        // Son satırı kaldır (```)
        if (cleanedListing.endsWith('```')) {
          cleanedListing = cleanedListing.substring(0, cleanedListing.lastIndexOf('```')).trim();
        }
        console.log(`🔍 [parseListing] Kod bloğu temizlendi, JSON parse ediliyor...`);
      }
      
      // Önce standart JSON formatını kontrol et
      try {
        const jsonObject = JSON.parse(cleanedListing);
        console.log(`✅ [parseListing] JSON başarıyla parse edildi:`);
        
        // Gerekli alanları kontrol et ve varsayılan değerlerle birleştir
        const result = {
          title: jsonObject.title || '',
          description: jsonObject.description || '',
          tags: Array.isArray(jsonObject.tags) ? jsonObject.tags : [],
          altTexts: Array.isArray(jsonObject.altTexts) ? jsonObject.altTexts : [],
          metadata: {
            timestamp: new Date().toISOString(),
            step: 'etsy_listing'
          }
        };
        
        console.log(`   - Başlık: ${result.title || 'Bulunamadı'}`);
        console.log(`   - Açıklama: ${result.description ? 'Bulundu (' + result.description.length + ' karakter)' : 'Bulunamadı'}`);
        console.log(`   - Etiketler: ${result.tags.length} adet`);
        console.log(`   - Alt metinler: ${result.altTexts.length} adet`);
        
        return result;
      } catch (jsonError) {
        console.warn(`⚠️ [parseListing] JSON parse hatası, alternatif format deneniyor: ${jsonError.message}`);
        
        // JSON parse edilemezse, eski format denemesi yap
        const result = {
          title: '',
          description: '',
          tags: [],
          altTexts: [],
          metadata: {
            timestamp: new Date().toISOString(),
            step: 'etsy_listing'
          }
        };

        // String'i bölümlere ayır ve her bölümü işle
        const sections = listing.split('\n\n');
        console.log(`🔍 [parseListing] ${sections.length} bölüm bulundu`);
        
        sections.forEach((section, index) => {
          console.log(`🔍 [parseListing] Bölüm ${index + 1} işleniyor (${section.length} karakter)...`);
          
          if (section.startsWith('Title:')) {
            result.title = section.replace('Title:', '').trim();
            console.log(`🔍 [parseListing] Başlık bulundu: "${result.title}"`);
          } else if (section.startsWith('Description:')) {
            result.description = section.replace('Description:', '').trim();
            console.log(`🔍 [parseListing] Açıklama bulundu (${result.description.length} karakter)`);
          } else if (section.startsWith('Tags:')) {
            // Virgülle ayrılmış etiketleri diziye dönüştür
            result.tags = section.replace('Tags:', '').split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
            console.log(`🔍 [parseListing] Etiketler bulundu: ${result.tags.length} adet`);
            console.log(`   - Etiketler: ${result.tags.join(', ')}`);
          } else if (section.startsWith('AltTexts:')) {
            // Alt metinleri satır satır ayır ve diziye dönüştür
            result.altTexts = section.replace('AltTexts:', '').split('\n').map(t => t.trim()).filter(t => t);
            console.log(`🔍 [parseListing] Alt metinler bulundu: ${result.altTexts.length} adet`);
          } else {
            console.warn(`⚠️ [parseListing] Tanınmayan bölüm: ${section.substring(0, 30)}...`);
          }
        });

        console.log(`✅ [parseListing] Parsing tamamlandı:`);
        console.log(`   - Başlık: ${result.title || 'Bulunamadı'}`);
        console.log(`   - Açıklama: ${result.description ? 'Bulundu (' + result.description.length + ' karakter)' : 'Bulunamadı'}`);
        console.log(`   - Etiketler: ${result.tags.length} adet`);
        console.log(`   - Alt metinler: ${result.altTexts.length} adet`);
        
        return result;
      }
    }

    console.error('❌ [parseListing] Geçersiz listing formatı!');
    throw new Error('Invalid listing format');
  } catch (error) {
    console.error('❌ [parseListing] Listing Parse Hatası:', error.message);
    console.error('❌ [parseListing] Hata detayı:', error.stack);
    return {
      error: 'Failed to parse listing',
      raw: listing
    };
  }
};

/**
 * Örüntü içeriğine dayalı olarak Etsy listesi oluşturur.
 * @param {Object} input - Örüntü içeriği ve diğer girdiler
 * @param {Object} options - İsteğe bağlı parametreler
 * @returns {Object} - Oluşturulan Etsy listesi veya hata nesnesi
 */
export const generateEtsyListing = async (input, options = {}) => {
  try {
    console.log('🧶 [generateEtsyListing] Başlıyor...');
    console.log('🧶 [generateEtsyListing] Giriş tipi:', input?.optimizedPattern ? 'optimizedPattern' : input?.pdfContent ? 'pdfContent' : 'bilinmiyor');
    
    // Örüntü içeriğinin varlığını kontrol et
    const pattern = input?.optimizedPattern || input?.pdfContent;
    if (!pattern) {
      console.error('❌ [generateEtsyListing] Örüntü içeriği bulunamadı!');
      throw new Error('Pattern content is required');
    }
    console.log('🧶 [generateEtsyListing] Örüntü uzunluğu:', pattern.length, 'karakter');
    console.log('🧶 [generateEtsyListing] Örüntü örneği (ilk 100 karakter):', pattern.substring(0, 100) + '...');
    
    // Markdown'ı JSON'a dönüştür
    console.log('🧶 [generateEtsyListing] Markdown to JSON dönüşümü başlıyor...');
    const structuredPattern = markdownToJson(pattern);
    
    if (!structuredPattern) {
      console.error('❌ [generateEtsyListing] Markdown to JSON dönüşümü başarısız oldu!');
      throw new Error('Failed to parse markdown content');
    }
    
    console.log('🧶 [generateEtsyListing] Markdown to JSON dönüşümü başarılı:');
    console.log(JSON.stringify(structuredPattern, null, 2));
    
    // Kullanıcı promptunu oluştur - artık JSON yapısını kullanıyoruz
    console.log('🧶 [generateEtsyListing] Kullanıcı promptu oluşturuluyor...');
    const userPrompt = `Create an Etsy listing for this knitting pattern:

Title: ${options.title || structuredPattern.title || 'Knitting Pattern'}

Pattern Information:
${JSON.stringify(structuredPattern, null, 2)}

Additional Tags: ${options.tags?.join(', ') || ''}`;
    
    console.log('🧶 [generateEtsyListing] Kullanıcı promptu oluşturuldu (uzunluk:', userPrompt.length, 'karakter)');

    let listing;
    try {
      // Önce backend API'yi dene
      const requestId = `etsy-${Date.now()}`;
      console.log(`🧶 [generateEtsyListing] [${requestId}] Backend API isteği hazırlanıyor...`);
      
      const data = {
        model: getEnv('DEEPSEEK_MODEL', 'deepseek-chat'),
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: parseInt(getEnv('DEEPSEEK_MAX_TOKENS', '4096'), 10)
      };
      
      console.log(`🧶 [generateEtsyListing] [${requestId}] DeepSeek API yapılandırması:`);
      console.log(`   - Model: ${data.model}`);
      console.log(`   - Max Tokens: ${data.max_tokens}`);
      console.log(`   - System Prompt Uzunluğu: ${SYSTEM_PROMPT.length} karakter`);
      console.log(`   - User Prompt Uzunluğu: ${userPrompt.length} karakter`);

      // Backend proxy üzerinden DeepSeek API'ye istek gönder
      console.log(`🧶 [generateEtsyListing] [${requestId}] Backend API'ye istek gönderiliyor...`);
      console.log(`🧶 [generateEtsyListing] [${requestId}] Endpoint: /api/deepseek`);
      
      // JWT token'ı localStorage'dan al
      const token = localStorage.getItem('zippify_token');
      
      const backendResponse = await backendApi.post('/api/deepseek', { ...data, featureKey: "create-listing" }, {
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
          'Authorization': token ? `Bearer ${token}` : ''
        },
        timeout: 180000 // 3 minutes
      });
      
      console.log(`🧶 [generateEtsyListing] [${requestId}] Backend API yanıtı alındı:`);
      console.log(`   - Status: ${backendResponse.status}`);
      console.log(`   - Status Text: ${backendResponse.statusText}`);
      
      if (backendResponse.data?.choices?.[0]?.message?.content) {
        listing = backendResponse.data.choices[0].message.content;
        console.log(`✅ [generateEtsyListing] [${requestId}] Backend API'den başarıyla listing alındı (uzunluk: ${listing.length} karakter)`);
        console.log(`🧶 [generateEtsyListing] [${requestId}] Listing örneği (ilk 200 karakter):`);
        console.log(listing.substring(0, 200) + '...');
      } else {
        console.error(`❌ [generateEtsyListing] [${requestId}] Backend API'den geçersiz yanıt alındı:`, backendResponse.data);
        throw new Error('Invalid response from backend API');
      }
    } catch (backendError) {
      console.warn(`⚠️ [generateEtsyListing] Backend API hatası:`, backendError.message);
      console.warn(`⚠️ [generateEtsyListing] Doğrudan API çağrısına geçiliyor...`);
      try {
        listing = await makeCompletion(SYSTEM_PROMPT, userPrompt);
        console.log(`✅ [generateEtsyListing] Doğrudan API çağrısı başarılı (uzunluk: ${listing.length} karakter)`);
      } catch (directApiError) {
        console.error(`❌ [generateEtsyListing] Doğrudan API çağrısı da başarısız oldu:`, directApiError.message);
        throw directApiError;
      }
    }

    console.log(`🧶 [generateEtsyListing] Listing parse ediliyor...`);
    const parsedListing = parseListing(listing);
    
    console.log(`✅ [generateEtsyListing] Listing başarıyla parse edildi:`);
    console.log(`   - Başlık: ${parsedListing.title}`);
    console.log(`   - Açıklama uzunluğu: ${parsedListing.description?.length || 0} karakter`);
    console.log(`   - Etiket sayısı: ${parsedListing.tags?.length || 0}`);
    console.log(`   - Alt metin sayısı: ${parsedListing.altTexts?.length || 0}`);
    
    return {
      success: true,
      ...parsedListing
    };
  } catch (error) {
    console.error('❌ [generateEtsyListing] Etsy Listing Oluşturma Hatası:', error.message);
    console.error('❌ [generateEtsyListing] Hata detayı:', error.stack);
    return {
      success: false,
      title: options?.title || 'Error',
      description: 'An error occurred while generating the listing.',
      tags: [],
      altTexts: [],
      error: error.message
    };
  }
};
