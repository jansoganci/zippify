/**
 * Prompt Enhancement Service
 * 
 * This service enhances user prompts for image editing using DeepSeek AI.
 * It is completely isolated from other DeepSeek integrations in the system.
 */

import log from '../../../utils/logger.js';
import { createDeepSeekClient, sendCompletionRequest } from './deepSeekClient.js';

/**
 * System prompt for enhancing image editing prompts
 * @param {string} category - Product category (jewelry, clothing, etc.)
 * @param {string} platform - Target platform (etsy, amazon, ebay)
 * @returns {string} System prompt
 */
const getSystemPrompt = (category = 'general', platform = 'ecommerce') => {
  return `You are an expert e-commerce product photographer specializing in ${category} for ${platform}. 
Your task is to enhance user prompts for AI image editing to create professional product photos.

When given a user's image editing request, improve it by adding specific details about:
1. Lighting (soft, natural, studio, dramatic)
2. Background (plain white, contextual, gradient, natural setting)
3. Composition (centered, rule of thirds, closeup, full product view)
4. Style (minimalist, elegant, rustic, modern, vintage)
5. Mood (bright and cheerful, sophisticated, cozy, professional)

IMPORTANT RULES:
- Maintain the user's original intent and product type
- Add specific details without changing the core request
- Focus on photographic improvements, not product modifications
- Keep the enhanced prompt concise (max 100 words)
- Use professional photography terminology
- DO NOT add creative elements not mentioned by the user
- DO NOT change the product itself, only enhance how it's photographed

Respond ONLY with the enhanced prompt. Do not include explanations, introductions, or any text that isn't part of the prompt itself.`;
};

/**
 * Enhances a user's image editing prompt using DeepSeek AI
 * @param {string} originalPrompt - The original user prompt
 * @param {Object} options - Enhancement options
 * @returns {Promise<Object>} Enhanced prompt result
 */
export async function enhanceImagePrompt(originalPrompt, options = {}) {
  const { 
    requestId = `prompt-${Date.now()}`, 
    timeout = 10000, // 10 seconds timeout
    category = 'general',
    platform = 'ecommerce' 
  } = options;
  
  // Skip enhancement for empty prompts
  if (!originalPrompt || originalPrompt.trim() === '') {
    log.warn(`[${requestId}] Empty prompt received, skipping enhancement`);
    return { 
      prompt: originalPrompt, 
      original: originalPrompt,
      enhanced: false 
    };
  }
  
  // Skip enhancement for very short prompts (likely just commands)
  if (originalPrompt.length < 5) {
    log.info(`[${requestId}] Prompt too short for enhancement: "${originalPrompt}"`);
    return { 
      prompt: originalPrompt, 
      original: originalPrompt,
      enhanced: false 
    };
  }
  
  log.info(`[${requestId}] Enhancing prompt: "${originalPrompt.substring(0, 30)}${originalPrompt.length > 30 ? '...' : ''}"`);
  
  try {
    // Create a dedicated DeepSeek client for this request
    const client = createDeepSeekClient();
    if (!client) {
      throw new Error('Failed to initialize DeepSeek client');
    }
    
    // Get the system prompt for this category and platform
    const systemPrompt = getSystemPrompt(category, platform);
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    // Send the request to DeepSeek
    const enhancedPrompt = await sendCompletionRequest(
      client,
      systemPrompt,
      originalPrompt,
      {
        requestId,
        timeout
      }
    );
    
    clearTimeout(timeoutId);
    
    // Development-only logging of the full enhanced prompt
    if (process.env.NODE_ENV !== 'production') {
      console.log("Enhanced Prompt:", enhancedPrompt);
    }
    
    log.info(`[${requestId}] Successfully enhanced prompt: "${enhancedPrompt.substring(0, 30)}${enhancedPrompt.length > 30 ? '...' : ''}"`);
    
    return { 
      prompt: enhancedPrompt, 
      original: originalPrompt,
      enhanced: true 
    };
  } catch (error) {
    // Enhanced error logging with stack trace and error code
    const errorCode = error.code || 'UNKNOWN_ERROR';
    log.warn(`[${requestId}] Failed to enhance prompt, using original: ${error.message} (Code: ${errorCode})`);
    
    // Development-only logging of the full error stack
    if (process.env.NODE_ENV !== 'production') {
      console.error(`Prompt enhancement error details:`, {
        message: error.message,
        stack: error.stack,
        code: errorCode
      });
    }
    
    return { 
      prompt: originalPrompt, 
      original: originalPrompt,
      enhanced: false 
    };
  }
}
