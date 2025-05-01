import axios from 'axios';
import { createApiError, ErrorCodes } from './utils/errors.js';
import log from '../../../utils/logger.js';

// Backend API için axios instance'ı
const backendApi = axios.create({
  baseURL: '/api',// Backend sunucusunun adresi
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to automatically include JWT token for backend requests
backendApi.interceptors.request.use(config => {
  // Only run in browser environment where localStorage is available
  if (typeof window !== 'undefined' && window.localStorage) {
    // Get token from localStorage
    const token = localStorage.getItem('zippify_token');
    
    if (token) {
      // Add Authorization header with Bearer token
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ JWT token attached to request');
    } else {
      console.log('❌ No JWT token found in localStorage');
    }
  }
  
  return config;
}, error => {
  // Handle request error
  return Promise.reject(error);
});

// Determine environment (Node.js or browser)
const isBrowser = typeof window !== 'undefined';
const isNode = !isBrowser && typeof process !== 'undefined';

// Get environment variables based on runtime environment
const getEnv = (key, defaultValue) => {
  if (isNode) {
    return process.env[key] || defaultValue;
  } else if (isBrowser && typeof import.meta !== 'undefined' && import.meta.env) {
    const viteKey = `VITE_${key}`;
    return import.meta.env[viteKey] || defaultValue;
  }
  return defaultValue;
};

// API Configuration with environment-aware variables
const API_URL = getEnv('DEEPSEEK_API_URL');
const MODEL = getEnv('DEEPSEEK_MODEL', 'deepseek-chat');
const MAX_TOKENS = parseInt(getEnv('DEEPSEEK_MAX_TOKENS', '4096'), 10);
const MAX_RETRIES = parseInt(getEnv('DEEPSEEK_MAX_RETRIES', '5'), 10); // Increased
const RETRY_DELAY = parseInt(getEnv('DEEPSEEK_RETRY_DELAY', '3000'), 10); // Increased
const TIMEOUT = parseInt(getEnv('DEEPSEEK_TIMEOUT', '60000'), 10); // Increased
const RATE_LIMIT = parseInt(getEnv('DEEPSEEK_RATE_LIMIT', '5'), 10); // Decreased

// Function to get API key dynamically when needed instead of at module load time
const getApiKey = () => {
  const apiKey = getEnv('DEEPSEEK_API_KEY', '');
  return apiKey;
};

// Debug: Log API configuration
console.log('DeepSeek API Configuration:', {
  API_URL,
  MODEL,
  MAX_TOKENS,
  MAX_RETRIES,
  RETRY_DELAY,
  TIMEOUT,
  RATE_LIMIT,
  API_KEY_PRESENT: false, // Will be checked at runtime
  ENVIRONMENT: isNode ? 'Node.js' : 'Browser'
});

// API key presence will be checked at runtime when needed
console.log("API key will be loaded at runtime when needed");

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
const USE_MOCK = getEnv('ENABLE_MOCK_MODE', 'false') === 'true';
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
  timeout: TIMEOUT,
  maxContentLength: 50 * 1024 * 1024, // 50MB
  maxBodyLength: 50 * 1024 * 1024, // 50MB
  decompress: true,
  validateStatus: (status) => status >= 200 && status < 500, // Don't reject if status < 500
  // Daha fazla hata ayıklama bilgisi için
  headers: {
    // Tarayıcıda User-Agent header'ları güvenlik nedeniyle manuel olarak ayarlanamaz
    // Bu yüzden sadece Node.js ortamında User-Agent ayarlıyoruz
    ...(isNode ? { 'User-Agent': 'Zippify/1.0' } : {}),
    'Accept': 'application/json',
  },
  // Bağlantı sorunlarını azaltmak için
  // Agent'lar kaldırıldı - ES Module uyumluluğu için
});

// Add request interceptor for logging and rate limiting
apiClient.interceptors.request.use(async (config) => {
  await checkRateLimit();
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Add response interceptor for logging
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.statusText}`);
    return response;
  },
  (error) => {
    log.error('API Error:', {
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
  // In backend context, get API key from server.js if not already set
  if (!API_KEY && isNode && process.env.DEEPSEEK_API_KEY) {
    // Log that we're using the API key from process.env
    console.log('Using DeepSeek API key from process.env');
    return true;
  }
  
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

  // Get the current API key dynamically - this ensures we always get the latest value
  // even if it was loaded after this module was initialized
  const currentApiKey = getApiKey();
  
  // Log the API key status (without exposing the actual key)
  console.log('API Key status:', currentApiKey ? `Present (length: ${currentApiKey.length})` : 'Missing');
  
  if (!currentApiKey) {
    log.error('API Key not found. Environment:', isNode ? 'Node.js' : 'Browser');
    throw createApiError('DeepSeek API key is not configured', { code: ErrorCodes.MISSING_REQUIRED_FIELD });
  }

  // Detailed API URL log
  const fullUrl = `${API_URL}${endpoint}`;
  console.log(`Full API URL: ${fullUrl}`);

  while (attempt <= maxAttempts) {
    try {
      log.info(`Making API request to ${endpoint} (Attempt ${attempt}/${maxAttempts})`, { 
        endpoint,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Request-ID': `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
      });
      
      // Add restricted headers only in Node.js environment
      if (isNode) {
        headers['Accept-Encoding'] = 'gzip,deflate,compress';
        headers['User-Agent'] = 'Zippify/1.0';
      }
      
      // Custom configuration for longer timeout
      const requestConfig = { 
        headers,
        timeout: TIMEOUT // Her istek için timeout'u ayarla
      };
      
      // Securely log API headers without exposing sensitive information
      if (headers?.Authorization) {
        console.log("Authorization header is present.");
      } else {
        log.warn("Authorization header is missing!");
      }
      
      // Log non-sensitive headers
      console.log(`API Request Headers:`, {
        'Content-Type': headers['Content-Type'],
        'Accept': headers['Accept'],
        'User-Agent': headers['User-Agent'],
        'X-Request-ID': headers['X-Request-ID']
      });
      
      const response = await apiClient.post(endpoint, data, requestConfig);
      
      // Handle rate limiting response
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers['retry-after'], 10) || RETRY_DELAY;
        throw createApiError('Rate limit exceeded', {
          code: ErrorCodes.RATE_LIMIT,
          metadata: { retryAfter, headers: response.headers }
        });
      }
      
      // Handle successful response
      if (response.data?.choices) {
        console.log(`API request successful`, {
          endpoint,
          status: response.status,
          choices: response.data.choices.length,
          attempt,
          responseHeaders: response.headers
        });
        return response;
      }
      
      // Handle invalid response format
      log.error('Invalid API response format:', response.data);
      throw createApiError('Invalid API response format', {
        code: ErrorCodes.INVALID_API_RESPONSE,
        metadata: { endpoint, response: response.data }
      });
      
    } catch (error) {
      lastError = error;
      
      // Detailed error log
      log.error('API request error details:', {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack,
        response: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          headers: error.response?.headers,
          data: error.response?.data
        },
        request: {
          method: error.config?.method,
          url: error.config?.url,
          headers: error.config?.headers,
          data: error.config?.data
        }
      });
      
      // Check for more error types
      const isTimeout = error.code === 'ECONNABORTED' || error.message.includes('timeout');
      const isConnectionReset = error.code === 'ECONNRESET';
      const isNetworkError = error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN' || error.message.includes('network');
      const isRateLimit = error.code === ErrorCodes.RATE_LIMIT || error.response?.status === 429;
      const isServerError = error.response?.status >= 500;
      const isRetryable = isTimeout || isRateLimit || isServerError || isConnectionReset || isNetworkError;
      
      if (isRetryable && attempt < maxAttempts) {
        // Smarter backoff strategy
        let delay;
        if (isRateLimit && error.metadata?.retryAfter) {
          delay = error.metadata.retryAfter;
        } else if (isConnectionReset || isNetworkError) {
          // Longer wait for network errors
          delay = Math.min(RETRY_DELAY * Math.pow(backoffFactor, attempt), 30000);
        } else {
          delay = Math.min(RETRY_DELAY * Math.pow(backoffFactor, attempt - 1), 30000);
        }
        
        log.warn(`API request failed, retrying in ${delay}ms... (Attempt ${attempt}/${maxAttempts})`, {
          endpoint,
          error: error.message,
          errorCode: error.code,
          status: error.response?.status,
          delay,
          retryReason: isTimeout ? 'timeout' : 
                       isConnectionReset ? 'connection_reset' :
                       isNetworkError ? 'network_error' :
                       isRateLimit ? 'rate_limit' :
                       isServerError ? 'server_error' : 'unknown'
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
    console.log('Using mock response');
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
    // If API_URL already contains '/chat/completions', don't append again
    const endpoint = API_URL.includes('/chat/completions') ? '' : '/chat/completions';
    const response = await makeRequest(endpoint, data);
    if (!response.data?.choices?.[0]?.message?.content) {
      throw createApiError('Invalid API response format', {
        code: ErrorCodes.INVALID_API_RESPONSE
      });
    }
    return response.data.choices[0].message.content;
  } catch (error) {
    if (error.code === ErrorCodes.API_TIMEOUT) {
      log.error('API request timed out, using fallback response');
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

export { apiClient, API_URL, MODEL, MAX_TOKENS, makeRequest, backendApi, getEnv };

