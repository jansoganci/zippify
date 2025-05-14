/**
 * Isolated DeepSeek client for prompt enhancement
 * This module is completely separate from the main DeepSeek integration
 * to ensure no interference with existing functionality.
 */

import axios from 'axios';
import log from '../../../utils/logger.js';
import https from 'https';

// Load configuration from environment variables with fallbacks
const DEFAULT_TIMEOUT = 30000; // Fixed timeout value (30 seconds)
const MAX_RETRIES = parseInt(process.env.DEEPSEEK_MAX_RETRIES || '3');
const RETRY_DELAY = parseInt(process.env.DEEPSEEK_RETRY_DELAY || '1000');
const DEFAULT_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
const DEFAULT_MAX_TOKENS = parseInt(process.env.DEEPSEEK_MAX_TOKENS || '4096');
const DEFAULT_API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';

/**
 * Creates a dedicated DeepSeek API client for prompt enhancement
 * @returns {Object} DeepSeek API client
 */
const createDeepSeekClient = () => {
  // Get API key and URL from environment variables
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const apiUrl = DEFAULT_API_URL;
  
  // Log API configuration (without exposing the full key)
  console.log('DeepSeek Client Configuration:', {
    apiUrl,
    model: DEFAULT_MODEL,
    maxTokens: DEFAULT_MAX_TOKENS,
    timeout: DEFAULT_TIMEOUT,
    maxRetries: MAX_RETRIES,
    retryDelay: RETRY_DELAY,
    apiKeyPresent: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    apiKeyPrefix: apiKey ? `${apiKey.substring(0, 5)}...` : 'missing'
  });
  
  if (!apiKey) {
    log.warn('DeepSeek API key not found for prompt enhancement service');
    return null;
  }
  
  // Create a dedicated axios instance for prompt enhancement
  const client = axios.create({
    baseURL: apiUrl,
    timeout: DEFAULT_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
      'User-Agent': 'Zippify/1.0'
    },
    // Increase maximum content length for large responses
    maxContentLength: 10 * 1024 * 1024, // 10MB
    // Add proxy settings if needed (uncomment and configure if behind a proxy)
    // proxy: {
    //   host: 'proxy-server',
    //   port: 8080
    // }
    // Disable SSL verification in development (not recommended for production)
    // SSL verification is always enabled in production
    ...(false ? { httpsAgent: new https.Agent({ rejectUnauthorized: false }) } : {})
  });
  
  return client;
};

/**
 * Sends a completion request to DeepSeek API
 * @param {Object} client - DeepSeek API client
 * @param {string} systemPrompt - System prompt for DeepSeek
 * @param {string} userPrompt - User prompt to enhance
 * @param {Object} options - Additional options
 * @returns {Promise<string>} Enhanced prompt
 */
// Helper function to sleep for a specified duration
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const sendCompletionRequest = async (client, systemPrompt, userPrompt, options = {}) => {
  const { 
    requestId = `prompt-${Date.now()}`, 
    timeout = DEFAULT_TIMEOUT,
    retries = MAX_RETRIES,
    retryDelay = RETRY_DELAY
  } = options;
  
  if (!client) {
    log.error(`[${requestId}] DeepSeek client not initialized`);
    throw new Error('DeepSeek client not initialized');
  }
  
  // Log the request details
  console.log(`[${requestId}] Sending request to DeepSeek API:`, {
    endpoint: '/chat/completions',
    model: 'deepseek-chat',
    promptLength: userPrompt.length,
    timeout: `${timeout}ms`,
    maxRetries: retries
  });
  
  let lastError = null;
  
  // Try multiple times with exponential backoff
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      if (attempt > 0) {
        log.info(`[${requestId}] Retry attempt ${attempt}/${retries} for DeepSeek API request`);
      }
      
      // Send request to DeepSeek API
      const response = await client.post('/chat/completions', {
        model: DEFAULT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: DEFAULT_MAX_TOKENS,
        temperature: 0.7,  // Add some creativity but not too much
        top_p: 0.95        // Slightly limit token selection for more focused responses
      }, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Validate response format
      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from DeepSeek API');
      }
      
      const enhancedPrompt = response.data.choices[0].message.content.trim();
      
      // Log success
      console.log(`[${requestId}] DeepSeek API request successful:`, {
        responseLength: enhancedPrompt.length,
        attempt: attempt + 1,
        totalAttempts: retries + 1
      });
      
      return enhancedPrompt;
    } catch (error) {
      lastError = error;
      const errorCode = error.code || 'UNKNOWN_ERROR';
      
      // Check if this is the last attempt
      if (attempt === retries) {
        // Log error details on final attempt
        log.error(`[${requestId}] DeepSeek API error after ${attempt + 1} attempts: ${error.message} (Code: ${errorCode})`);
        
        // Development-only logging of the full error stack
        if (process.env.NODE_ENV !== 'production') {
          console.error(`DeepSeek API error details:`, {
            message: error.message,
            stack: error.stack,
            code: errorCode,
            attempts: attempt + 1
          });
        }
        
        throw error;
      }
      
      // For retryable errors, wait and try again
      const isTimeout = error.code === 'ECONNABORTED' || error.message.includes('timeout');
      const isNetworkError = ['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND'].includes(error.code);
      const isServerError = error.response?.status >= 500;
      
      if (isTimeout || isNetworkError || isServerError) {
        // Calculate backoff with jitter
        const jitter = Math.random() * 0.3 + 0.85; // Random value between 0.85 and 1.15
        const delay = Math.min(retryDelay * Math.pow(1.5, attempt) * jitter, 10000);
        
        log.warn(`[${requestId}] Retryable error (${errorCode}), waiting ${Math.round(delay)}ms before retry ${attempt + 1}/${retries}`);
        await sleep(delay);
        continue;
      } else {
        // Non-retryable error
        log.error(`[${requestId}] Non-retryable DeepSeek API error: ${error.message} (Code: ${errorCode})`);
        throw error;
      }
    }
  }
  
  // If we get here, all retries failed
  throw lastError || new Error(`Failed to get response from DeepSeek API after ${retries + 1} attempts`);
};

export { createDeepSeekClient, sendCompletionRequest };
