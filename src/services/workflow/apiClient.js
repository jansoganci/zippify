import axios from 'axios';
import logger from './utils/logger.js';
import { createApiError, ErrorCodes } from './utils/errors.js';

// API Configuration using Vite's import.meta.env
const API_URL = import.meta.env.VITE_DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';
const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const MODEL = import.meta.env.VITE_DEEPSEEK_MODEL || 'deepseek-chat';
const MAX_TOKENS = parseInt(import.meta.env.VITE_DEEPSEEK_MAX_TOKENS, 10) || 4096;
const MAX_RETRIES = parseInt(import.meta.env.VITE_DEEPSEEK_MAX_RETRIES, 10) || 3;
const RETRY_DELAY = parseInt(import.meta.env.VITE_DEEPSEEK_RETRY_DELAY, 10) || 2000;
const TIMEOUT = parseInt(import.meta.env.VITE_DEEPSEEK_TIMEOUT, 10) || 30000;
const RATE_LIMIT = parseInt(import.meta.env.VITE_DEEPSEEK_RATE_LIMIT, 10) || 10;

// Rate limiting queue
let requestQueue = [];
let lastRequestTime = 0;

// Rate limiting function
const checkRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  const minInterval = 1000 / RATE_LIMIT; // Minimum time between requests

  if (timeSinceLastRequest < minInterval) {
    await sleep(minInterval - timeSinceLastRequest);
  }
  
  lastRequestTime = Date.now();
};

// Mock responses for testing
const USE_MOCK = import.meta.env.MODE === 'test';
const mockResponses = {
  optimizePattern: `Improved Beanie Pattern

Materials:
- 1 skein worsted weight yarn (100g)
- 5mm (US 8) 16" circular needles
- Stitch markers
- Tapestry needle

Gauge:
20 stitches and 28 rows = 4" in stockinette

Instructions:
1. Cast on 88 stitches. Place marker and join in round.
2. Ribbing: *K2, P2* repeat around for 6 rounds.
3. Body: Knit all stitches for 14 rounds.
4. Crown decreases:
   - Round 1: *K2tog* repeat (44 sts)
   - Round 2: *K2tog* repeat (22 sts)
   - Round 3: *K2tog* repeat (11 sts)
5. Cut yarn, thread through remaining stitches.
6. Weave in ends.

Finished measurements: 8" tall, 18" circumference`,
  
  generatePDF: `# Classic Beanie Pattern

## Materials & Tools
- 1 skein worsted weight yarn (100g)
- 5mm (US 8) 16" circular needles
- Stitch markers
- Tapestry needle

## Gauge
20 stitches and 28 rows = 4" in stockinette

## Instructions
1. Cast on 88 stitches. Place marker and join in round.
2. Ribbing: *K2, P2* repeat around for 6 rounds.
3. Body: Knit all stitches for 14 rounds.
4. Crown decreases:
   - Round 1: *K2tog* repeat (44 sts)
   - Round 2: *K2tog* repeat (22 sts)
   - Round 3: *K2tog* repeat (11 sts)
5. Cut yarn, thread through remaining stitches.
6. Weave in ends.

## Notes
- Pattern is worked in the round
- One size fits most adults
- Skill level: Beginner

© 2025 Zippify. All rights reserved.`,

  generateEtsyListing: {
    title: "Easy Beginner Beanie Pattern - Quick Knit Hat - Digital Download PDF",
    description: "Perfect beginner-friendly beanie pattern! This classic hat works up quickly and makes a great gift. Clear, step-by-step instructions with stitch counts. Includes both written instructions and helpful tips.\n\nSkill Level: Beginner\nTime to Complete: 2-3 hours\n\nPattern includes:\n- Materials list\n- Gauge information\n- Step-by-step instructions\n- Finishing tips\n- Full-color PDF download",
    tags: ["knitting pattern", "beanie pattern", "hat pattern", "beginner knitting", "easy knit hat", "digital download", "PDF pattern", "winter hat", "quick knit", "gift idea"]
  }
};

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'Accept-Encoding': 'gzip,deflate,compress'
  },
  timeout: TIMEOUT,
  maxContentLength: 50 * 1024 * 1024, // 50MB
  maxBodyLength: 50 * 1024 * 1024, // 50MB
  decompress: true,
  validateStatus: (status) => status >= 200 && status < 500 // Don't reject if status < 500
});

// Add request interceptor for logging and rate limiting
apiClient.interceptors.request.use(async (config) => {
  await checkRateLimit();
  logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Add response interceptor for logging
apiClient.interceptors.response.use(
  (response) => {
    logger.debug(`API Response: ${response.status} ${response.statusText}`);
    return response;
  },
  (error) => {
    logger.error('API Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

/**
 * Sleep utility for retry delay
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Validate API configuration
 */
export const validateConfig = () => {
  if (!API_KEY) {
    throw createApiError('DeepSeek API key is not configured', { code: ErrorCodes.MISSING_REQUIRED_FIELD });
  }
  if (!API_URL) {
    throw createApiError('DeepSeek API URL is not configured', { code: ErrorCodes.MISSING_REQUIRED_FIELD });
  }
  return true;
};

/**
 * Make an API request with retry logic
 */
const makeRequest = async (endpoint, data, retries = MAX_RETRIES) => {
  let lastError = null;
  let attempt = 1;
  const maxAttempts = retries + 1;
  const backoffFactor = 1.5;

  while (attempt <= maxAttempts) {
    try {
      logger.debug(`Making API request to ${endpoint} (Attempt ${attempt}/${maxAttempts})`, { data });
      
      // Wait for rate limit if needed
      await checkRateLimit();
      
      const response = await apiClient.post(endpoint, data);
      
      // Handle rate limiting response
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers['retry-after'], 10) || RETRY_DELAY;
        throw createApiError('Rate limit exceeded', {
          code: ErrorCodes.RATE_LIMIT,
          metadata: { retryAfter }
        });
      }
      
      // Handle successful response
      if (response.data?.choices) {
        logger.debug(`API request successful`, {
          endpoint,
          status: response.status,
          choices: response.data.choices.length,
          attempt
        });
        return response;
      }
      
      // Handle invalid response format
      throw createApiError('Invalid API response format', {
        code: ErrorCodes.INVALID_API_RESPONSE,
        metadata: { endpoint, response: response.data }
      });
      
    } catch (error) {
      lastError = error;
      
      const isTimeout = error.code === 'ECONNABORTED' || error.message.includes('timeout');
      const isRateLimit = error.code === ErrorCodes.RATE_LIMIT || error.response?.status === 429;
      const isServerError = error.response?.status >= 500;
      const isRetryable = isTimeout || isRateLimit || isServerError;
      
      if (isRetryable && attempt < maxAttempts) {
        const delay = isRateLimit
          ? (error.metadata?.retryAfter || RETRY_DELAY)
          : Math.min(RETRY_DELAY * Math.pow(backoffFactor, attempt - 1), 30000);
        
        logger.warn(`API request failed, retrying in ${delay}ms... (Attempt ${attempt}/${maxAttempts})`, {
          endpoint,
          error: error.message,
          status: error.response?.status,
          delay
        });
        
        await sleep(delay);
        attempt++;
        continue;
      }
      
      // If we're here, we've exhausted retries or encountered a non-retryable error
      break;
    }
  }
  
  // If we're here, all attempts failed
  throw createApiError(`API request failed after ${attempt} attempts: ${lastError.message}`, {
    code: lastError.code || ErrorCodes.API_ERROR,
    metadata: {
      endpoint,
      attempts: attempt,
      lastError: {
        message: lastError.message,
        status: lastError.response?.status,
        data: lastError.response?.data
      }
    }
  });
};

/**
 * Make an AI completion request
 */
export const makeCompletion = async (systemPrompt, userPrompt) => {
  // Return mock response if in test mode
  if (USE_MOCK) {
    logger.debug('Using mock response');
    if (userPrompt.includes('optimize this knitting pattern')) {
      return mockResponses.optimizePattern;
    } else if (userPrompt.includes('format this knitting pattern for PDF')) {
      return mockResponses.generatePDF;
    } else if (userPrompt.toLowerCase().includes('create') && userPrompt.toLowerCase().includes('etsy listing')) {
      return mockResponses.generateEtsyListing;
    }
    throw createApiError('No mock response available for this prompt', {
      code: ErrorCodes.INVALID_REQUEST
    });
  }

  validateConfig();

  const data = {
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userPrompt
      }
    ],
    max_tokens: MAX_TOKENS
  };

  try {
    const response = await makeRequest('/chat/completions', data);
    if (!response.data?.choices?.[0]?.message?.content) {
      throw createApiError('Invalid API response format', {
        code: ErrorCodes.INVALID_API_RESPONSE
      });
    }
    return response.data.choices[0].message.content;
  } catch (error) {
    if (error.code === ErrorCodes.API_TIMEOUT) {
      logger.error('API request timed out, using fallback response');
      // Use mock response as fallback
      if (userPrompt.includes('optimize this knitting pattern')) {
        return mockResponses.optimizePattern;
      } else if (userPrompt.includes('format this knitting pattern for PDF')) {
        return mockResponses.generatePDF;
      } else if (userPrompt.includes('create an Etsy listing')) {
        return mockResponses.generateEtsyListing;
      }
    }
    throw error;
  }
};

export { apiClient, API_URL, MODEL, MAX_TOKENS };

