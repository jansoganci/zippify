import express from 'express';
import fetch from 'node-fetch';
import log from '../utils/logger.js';

const router = express.Router();

// DeepSeek proxy ayarları
// URL'nin sonunda /chat/completions olup olmadığını kontrol ediyoruz
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';
const DEEPSEEK_ENDPOINT = DEEPSEEK_API_URL.endsWith('/chat/completions') ? 
  DEEPSEEK_API_URL : 
  `${DEEPSEEK_API_URL}/chat/completions`;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// Quota kontrolü için yardımcı fonksiyon (server.js'den alındı)
function checkQuota(featureKey) {
  // Doğrudan middleware fonksiyonu döndürüyoruz (async değil)
  return (req, res, next) => {
    // Quota kontrolü burada yapılabilir
    // Şimdilik her zaman geçiş izni veriyoruz
    next();
  };
}

// DeepSeek API'ye proxy işlemi
async function proxyToDeepSeekAPI(req, res, requestId) {
  try {
    // 1. Validate request payload
    const { system, prompt } = req.body;
    
    if (!system || !prompt) {
      log.error(`[${requestId}] Invalid request payload:`, {
        hasSystem: !!system,
        hasPrompt: !!prompt,
        bodyKeys: Object.keys(req.body)
      });
      return res.status(400).json({
        error: 'Invalid request payload. Both system and prompt are required.',
        requestId
      });
    }
    
    // 2. Log request details (sanitized)
    log.info(`[${requestId}] DeepSeek API request:`, {
      endpoint: DEEPSEEK_ENDPOINT,
      systemPromptLength: system?.length || 0,
      userPromptLength: prompt?.length || 0,
      apiKeyPresent: !!DEEPSEEK_API_KEY
    });
    
    // 3. Format request payload for DeepSeek API
    const requestPayload = {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: system
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      stream: false
    };
    
    // 4. Make API request
    const response = await fetch(DEEPSEEK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Accept': 'application/json',
        'User-Agent': 'Zippify-Backend/1.0'
      },
      body: JSON.stringify(requestPayload)
    });
    
    // 5. Process response
    const data = await response.json();
    
    // 6. Format response for frontend
    const content = data?.choices?.[0]?.message?.content || '';
    
    return res.json({
      content,
      raw: data
    });
  } catch (error) {
    log.error(`[${requestId}] DeepSeek API Error:`, {
      message: error.message,
      stack: error.stack
    });
    
    return res.status(500).json({
      error: `Failed to proxy request to DeepSeek API: ${error.message}`,
      requestId
    });
  }
}

// Ana router endpoint
router.post('/:provider', async (req, res) => {
  const { provider } = req.params;
  const requestId = req.headers['x-request-id'] || `req-${Date.now()}`;
  const { featureKey } = req.body;
  
  // featureKey kontrolü
  if (!featureKey || typeof featureKey !== "string") {
    return res.status(400).json({ error: "Missing or invalid featureKey" });
  }
  
  log.info(`[${requestId}] Received AI request for provider: ${provider}, feature: ${featureKey}`);
  
  if (provider === 'deepseek') {
    if (!DEEPSEEK_API_KEY) {
      return res.status(500).json({ error: 'DeepSeek API key not set in backend environment.' });
    }
    
    // Quota kontrolü
    const quotaMiddleware = checkQuota(featureKey);
    quotaMiddleware(req, res, async () => {
      try {
        await proxyToDeepSeekAPI(req, res, requestId);
        // Quota increment handled by frontend
      } catch (error) {
        log.error(`[${requestId}] DeepSeek API Proxy Error:`, error);
        res.status(500).json({
          error: `Failed to proxy request to DeepSeek API: ${error.message}`,
          requestId
        });
      }
    });
    return;
  }

  // Diğer providerlar için (örn. openai, gemini) burada yönlendirme eklenebilir
  res.status(400).json({ error: `AI provider '${provider}' not supported yet.` });
});

export default router;
