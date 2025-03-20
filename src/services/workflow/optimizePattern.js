import { makeCompletion } from './apiClient.js';

const SYSTEM_PROMPT = `You are an expert knitting pattern editor. Your task is to optimize knitting patterns for clarity and technical accuracy while maintaining the original instructions's intent.

Guidelines:
1. Maintain consistent terminology
2. Add clear section breaks
3. Include stitch counts where helpful
4. Preserve all technical details
5. Format in a clear, step-by-step manner`;

/**
 * Step 1: Optimizes a knitting pattern for clarity and technical accuracy
 * 
 * @param {string} pattern - Raw knitting pattern text
 * @returns {Promise<Object>} - Optimized pattern or error
 */
export const optimizePattern = async (pattern) => {
  try {
    if (!pattern) {
      throw new Error('Pattern text is required');
    }

    const userPrompt = `Please optimize this knitting pattern for clarity and technical accuracy:\n\n${pattern}`;
    const optimizedPattern = await makeCompletion(SYSTEM_PROMPT, userPrompt);

    return {
      success: true,
      optimizedPattern,
      originalPattern: pattern,
      metadata: {
        timestamp: new Date().toISOString(),
        step: 'pattern_optimization'
      }
    };

  } catch (error) {
    console.error('Pattern Optimization Error:', error.message);
    return {
      success: false,
      error: error.message,
      originalPattern: pattern
    };
  }
};
