import { makeCompletion } from './apiClient.js';

const SYSTEM_PROMPT = `You are an expert in knitting and crochet patterns. Your task is to optimize and enhance the given pattern while:
1. Maintaining all technical instructions exactly as provided
2. Improving clarity and readability
3. Adding helpful notes for beginners where appropriate
4. Ensuring all abbreviations are properly explained
5. Organizing content into clear sections (Materials, Size Guide, Instructions, etc.)
6. Keeping the original measurements and stitch counts intact
7. Using standard knitting/crochet terminology
8. Adding any missing essential information (gauge, difficulty level, etc.)

Format the output as a clean, well-structured pattern that's easy to follow.`;

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
      console.error(`[${requestId}] Pattern text is missing`);
      throw new Error('Pattern text is required');
    }
    
    if (typeof pattern !== 'string') {
      console.error(`[${requestId}] Invalid pattern type: ${typeof pattern}`);
      throw new Error('Pattern must be a string');
    }

    // Log pattern length for debugging
    console.log(`[${requestId}] Pattern length: ${pattern.length} characters`);
    
    // Prepare API request
    const userPrompt = `Please optimize this knitting pattern for clarity and technical accuracy:\n\n${pattern}`;
    console.log(`[${requestId}] Calling DeepSeek API with prompt length: ${userPrompt.length}`);
    
    // Make API call with timeout handling
    let optimizedPattern;
    try {
      optimizedPattern = await Promise.race([
        makeCompletion(SYSTEM_PROMPT, userPrompt),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API request timed out after 90 seconds')), 180000)
        )
      ]);
    } catch (apiError) {
      console.error(`[${requestId}] API error:`, apiError);
      throw new Error(`DeepSeek API error: ${apiError.message}`);
    }
    
    // Validate response
    if (!optimizedPattern || typeof optimizedPattern !== 'string' || optimizedPattern.length < 10) {
      console.error(`[${requestId}] Invalid API response:`, optimizedPattern);
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
    console.error(`[${requestId}] Pattern Optimization Error:`, error);
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
