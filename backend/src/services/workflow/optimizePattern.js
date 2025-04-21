import { makeCompletion, backendApi, getEnv } from './apiClient.js';

const SYSTEM_PROMPT = `
You are a knitting pattern editor and optimization expert.

Your job is to rewrite the provided pattern into a **clear, professional, and beginner-friendly format**, without altering the core stitch counts or measurements.

Output Format Guidelines:
- Use clear section headings like: 
  1. Title and Pattern Summary
  2. Materials and Tools
  3. Skill Level & Gauge
  4. Abbreviations
  5. Pattern Instructions
  6. Notes & Tips (Optional)
- Use numbered steps for instructions. Example:
  Row 1: K2, P2  
  Row 2: Repeat Row 1

Rules:
- Keep original stitch counts and measurements intact.
- Do not invent design changes or remove sections.
- Rewrite unclear or messy sentences to be more readable.
- If abbreviations are used, include a bullet list explaining them.
- If important info like gauge or difficulty is missing, add a note like:  
  "_Note: Designer did not specify gauge. We recommend swatching before starting._"

Tone:
Use a helpful, calm, and encouraging tone. Assume the reader may be a beginner.

Goal:
Make the pattern easier to read, follow, and complete — especially for beginners.
Return ONLY the cleaned and optimized pattern as plain text with clear formatting.
`;
/**
 * Step 1: Optimizes a knitting pattern for clarity and technical accuracy
 * 
 * @param {string} pattern - Raw knitting pattern text
 * @returns {Promise<Object>} - Optimized pattern or error
 */
export const optimizePattern = async (pattern) => {
  const requestId = `opt-${Date.now()}`;
  console.log(`[${requestId}] Starting pattern optimization`);
  
  try {
    // Validate input
    if (!pattern) {
      logger.error(`[${requestId}] Pattern text is missing`);
      throw new Error('Pattern text is required');
    }
    
    if (typeof pattern !== 'string') {
      logger.error(`[${requestId}] Invalid pattern type: ${typeof pattern}`);
      throw new Error('Pattern must be a string');
    }

    // Log pattern length for debugging
    console.log(`[${requestId}] Pattern length: ${pattern.length} characters`);
    
    // Prepare API request
    const userPrompt = `Please optimize this knitting pattern for clarity and technical accuracy:\n\n${pattern}`;
    console.log(`[${requestId}] Calling backend API with prompt length: ${userPrompt.length}`);
    
    // Make API call with timeout handling
    let optimizedPattern;
    try {
      // Backend API'ye istek yap
      try {
        // DeepSeek API isteği için gerekli verileri hazırla
        const data = {
          model: getEnv('DEEPSEEK_MODEL', 'deepseek-chat'),
          messages: [
            {
              role: 'system',
              content: SYSTEM_PROMPT
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          max_tokens: parseInt(getEnv('DEEPSEEK_MAX_TOKENS', '4096'), 10)
        };
        
        // Backend proxy'ye istek yap
        // JWT token'ı localStorage'dan al
        const token = localStorage.getItem('zippify_token');
        
        const backendResponse = await backendApi.post('/api/deepseek', { ...data, featureKey: "create-listing" }, {
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': requestId,
            'Authorization': token ? `Bearer ${token}` : ''
          },
          timeout: 180000 // 3 dakika timeout
        });
        
        if (backendResponse.data?.choices?.[0]?.message?.content) {
          optimizedPattern = backendResponse.data.choices[0].message.content;
          console.log(`[${requestId}] Successfully received response from backend API`);
        } else {
          throw new Error('Invalid response from backend API');
        }
      } catch (backendError) {
        // If backend fails, try using direct API (fallback)
        logger.warn(`[${requestId}] Backend API error, falling back to direct API call:`, backendError.message);
        optimizedPattern = await Promise.race([
          makeCompletion(SYSTEM_PROMPT, userPrompt),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('API request timed out after 90 seconds')), 180000)
          )
        ]);
      }
    } catch (apiError) {
      logger.error(`[${requestId}] API error:`, apiError);
      throw new Error(`DeepSeek API error: ${apiError.message}`);
    }
    
    // Validate response
    if (!optimizedPattern || typeof optimizedPattern !== 'string' || optimizedPattern.length < 10) {
      logger.error(`[${requestId}] Invalid API response:`, optimizedPattern);
      throw new Error('Received invalid response from DeepSeek API');
    }
    
    console.log(`[${requestId}] Successfully optimized pattern. New length: ${optimizedPattern.length} characters`);

    return {
      success: true,
      optimizedPattern,
      originalPattern: pattern,
      metadata: {
        timestamp: new Date().toISOString(),
        step: 'pattern_optimization',
        requestId
      }
    };

  } catch (error) {
    logger.error(`[${requestId}] Pattern Optimization Error:`, error);
    return {
      success: false,
      error: error.message,
      originalPattern: pattern,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId
      }
    };
  }
};
