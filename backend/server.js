import log from './utils/logger.js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file path and directory (ES Module compatible way)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine which .env file to load based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
const envPath = path.resolve(__dirname, envFile);
dotenv.config({ path: envPath });

log.info(`Attempting to load environment from: ${envPath}`);

console.log("🔍 ENV CHECK → NODE_ENV =", process.env.NODE_ENV);
console.log("🔍 ENV CHECK → GEMINI_MODEL =", process.env.GEMINI_MODEL);

// Check if JWT_SECRET is defined
if (!process.env.JWT_SECRET) {
  const errorMsg = 'JWT_SECRET is not defined in environment variables';
  log.error(errorMsg);
  throw new Error(errorMsg);
}

// Log environment status for debugging
log.info('JWT configuration loaded successfully');

// Now import other dependencies after environment variables are loaded
import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { callGeminiApi } from './src/services/imageEditing/callGeminiApi.js';
import bodyParser from 'body-parser';

// SSL certificate validation is always enabled in production
if (false) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  log.warn('WARNING: SSL certificate validation is disabled for development');
} else {
  // Ensure SSL certificate validation is enabled
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
  log.info('✅ SSL certificate validation is enabled');
}

// Debug: Log API key presence and format
log.info('DeepSeek API Key Status:', {
  present: !!process.env.DEEPSEEK_API_KEY,
  length: process.env.DEEPSEEK_API_KEY?.length,
  prefix: process.env.DEEPSEEK_API_KEY?.substring(0, 5) + '...',
});

const app = express();
const PORT = process.env.PORT || 3001;

// Add detailed request/response logging middleware
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  req.requestId = requestId;
  req.startTime = Date.now();
  
  // Log incoming request
  log.request(req, 'Incoming request');
  
  // Log request body for debugging (but sanitize sensitive data)
  if (req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '***';
    if (sanitizedBody.token) sanitizedBody.token = '***';
    log.debug(`[${requestId}] Request body:`, sanitizedBody);
  }
  
  // Override res.json to log responses
  const originalJson = res.json;
  res.json = function(obj) {
    const duration = Date.now() - req.startTime;
    log.response(res, 'Response sent', {
      requestId,
      responseSize: JSON.stringify(obj).length,
      success: obj.success !== false,
      duration: `${duration}ms`
    });
    return originalJson.call(this, obj);
  };
  
  // Log response when request finishes
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    log.info(`[${requestId}] Request completed`, {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.headers['user-agent']?.substring(0, 100) + '...'
    });
  });
  
  next();
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running properly!' });
});

// Authentication Routes
app.use('/api/auth', authRoutes);

// Profile Route
app.use('/api/profile', profileRoutes);

// Keyword Analysis Route
app.use('/api/keywords', keywordAnalysisRoutes);

// Advanced Keyword Analysis Route (Google Trends)
app.use('/api/advanced-keywords', advancedKeywordRoutes);

// Listings Route
app.use('/api/listings', listingRoutes);

// Image Editing Routes
app.use('/api', imageEditingRouter);

// GPT Image Editing Route
app.use('/api/image/edit/gpt', gptImageRoutes);

// Content Optimization Route

// Import workflow services
import { optimizePattern } from './src/services/workflow/optimizePattern.js';
import { generatePDF } from './src/services/workflow/generatePDF.js';
import { generateEtsyListing } from './src/services/workflow/generateEtsyListing.js';

import { saveListing } from './src/features/listings/services/listingService.js';

// Import routes
import { keywordRoutes as keywordAnalysisRoutes } from './src/features/keywordAnalysis/index.js';
import { listingRoutes } from './src/features/listings/index.js';
import imageEditingRouter from './src/features/imageEditing/imageEditing.routes.js';
import { gptImageRoutes } from './src/features/imageEditing/index.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import advancedKeywordRoutes from './src/features/advancedKeywordAnalysis/routes/advancedKeywordRoutes.js';

// DeepSeek API proxy function with improved error handling and logging
// Bu fonksiyon aiRoutes.js dosyasına taşındı
// Kodun daha modüler olması için, tüm AI ile ilgili işlemler aiRoutes.js dosyasında toplanıyor
// Bu sayede, yeni AI sağlayıcıları eklemek daha kolay olacak

app.post('/api/optimize', async (req, res) => {
  const requestId = req.headers['x-request-id'] || `req-${Date.now()}`;
  log.info(`[${requestId}] Received optimize request`);
  
  try {
    log.info(`[${requestId}] Request body:`, req.body);
    const { content } = req.body;
    
    if (!content) {
      log.info(`[${requestId}] Content is missing from request`);
      return res.status(400).json({ 
        error: 'Content is required',
        requestId
      });
    }

    // Validate content length
    if (content.length < 10) {
      log.info(`[${requestId}] Content too short: ${content.length} chars`);
      return res.status(400).json({
        error: 'Content is too short. Please provide a complete pattern.',
        requestId
      });
    }

    log.info(`[${requestId}] Calling optimizePattern with content length: ${content.length} chars`);
    const result = await optimizePattern(content).catch(err => {
      log.error(`[${requestId}] Error in optimizePattern:`, err);
      return { success: false, error: err.message };
    });
    
    log.info(`[${requestId}] optimizePattern result:`, {
      success: result.success,
      hasOptimizedPattern: !!result.optimizedPattern,
      optimizedPatternLength: result.optimizedPattern?.length,
      error: result.error
    });
    
    if (result.success) {
      res.json({
        optimizedContent: result.optimizedPattern, // rename burada yapıldı
        requestId
      });
    } else {
      res.status(400).json({
        error: result.error || 'Unknown error during pattern optimization',
        requestId
      });
    }
  } catch (error) {
    log.error(`[${requestId}] Pattern Optimization Error:`, error);
    res.status(500).json({
      error: `Failed to optimize pattern: ${error.message}`,
      requestId
    });
  }
});

// **DATABASE CONNECTION**
const DB_PATH = './db/zippify.db';
const SCHEMA_PATH = './db/schema.sql';

const initializeDb = async () => {
    return open({
        filename: DB_PATH,
        driver: sqlite3.Database
    });
};

// **AUTHENTICATION ROUTES**
// Authentication routes are handled by authRoutes.js via app.use('/api/auth', authRoutes)

// **Server Start**
// Yönlendirme: /api/deepseek -> /api/ai/deepseek
// Bu yönlendirme, eski kodun çalışmaya devam etmesini sağlar (geriye dönük uyumluluk)
app.post('/api/deepseek', verifyToken, (req, res) => {
  // Eski endpoint'i logla
  log.info(`[DEPRECATED] Received request to /api/deepseek - This endpoint is deprecated, use /api/ai/deepseek instead`);
  
  // İsteği /api/ai/deepseek'e yönlendir
  // Bu, frontend kodunu değiştirmeden geçiş yapmamızı sağlar
  req.url = '/deepseek';
  app._router.handle(req, res);
});

// Manual Quota Increment Endpoint
app.post('/api/increment-quota', verifyToken, async (req, res) => {
  const { featureKey } = req.body;
  
  if (!featureKey || typeof featureKey !== "string") {
    return res.status(400).json({ error: "Missing or invalid featureKey" });
  }
  
  try {
    await incrementQuota(req.user.id, featureKey);
    log.info(`[quota] Manually incremented usage for user ${req.user.id} — Feature: ${featureKey}`);
    return res.json({ success: true });
  } catch (err) {
    log.error(`[quota] Error incrementing quota:`, err);
    return res.status(500).json({ error: err.message });
  }
});

// Quota Check Endpoints for each feature
async function getDb() {
  return open({
    filename: './db/zippify.db',
    driver: sqlite3.Database
  });
}

async function getUserQuotaInfo(userId, featureName, userPlan) {
  const db = await getDb();
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const result = await db.get(
      'SELECT request_count FROM user_quota WHERE user_id = ? AND feature = ? AND date = ?',
      [userId, featureName, today]
    );
    
    const currentUsage = result ? result.request_count : 0;
    const limit = userPlan === 'premium' ? 100 : 10;
    
    return {
      used: currentUsage,
      limit: limit,
      plan: userPlan
    };
  } catch (error) {
    console.error('Error getting quota info:', error);
    return {
      used: 0,
      limit: userPlan === 'premium' ? 100 : 10,
      plan: userPlan
    };
  } finally {
    await db.close();
  }
}

// SEO Analysis Quota Check
app.get('/api/seo-analysis/quota', verifyToken, async (req, res) => {
  try {
    const quotaInfo = await getUserQuotaInfo(req.user.id, 'seo-analysis', req.user.plan);
    res.json({
      success: true,
      ...quotaInfo
    });
  } catch (error) {
    console.error('Error checking SEO quota:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to check quota' 
    });
  }
});

// Create Listing Quota Check  
app.get('/api/create-listing/quota', verifyToken, async (req, res) => {
  try {
    const quotaInfo = await getUserQuotaInfo(req.user.id, 'create-listing', req.user.plan);
    res.json({
      success: true,
      ...quotaInfo
    });
  } catch (error) {
    console.error('Error checking Create Listing quota:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to check quota' 
    });
  }
});

// Edit Image Quota Check
app.get('/api/edit-image/quota', verifyToken, async (req, res) => {
  try {
    const quotaInfo = await getUserQuotaInfo(req.user.id, 'edit-image', req.user.plan);
    res.json({
      success: true,
      ...quotaInfo
    });
  } catch (error) {
    console.error('Error checking Edit Image quota:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to check quota' 
    });
  }
});

// Initialize the SQLite database with schema before starting the server
async function initializeDatabaseWithSchema() {
    try {
        log.info('Initializing SQLite database...');
        
        // Create the database directory if it doesn't exist
        const dbDir = path.dirname(DB_PATH);
        if (!fs.existsSync(dbDir)) {
            log.info(`Creating database directory: ${dbDir}`);
            fs.mkdirSync(dbDir, { recursive: true });
        }
        
        // Connect to the database (creates it if it doesn't exist)
        const db = await open({
            filename: DB_PATH,
            driver: sqlite3.Database
        });
        log.info(`Connected to SQLite database at: ${DB_PATH}`);
        
        // In development mode, reset the database by dropping all tables
        // --- Database reset logic disabled in development mode ---
        /*
        if (process.env.NODE_ENV === 'development') {
            log.info('Development mode detected - Resetting database...');
            
            // Get all tables in the database
            const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
            
            // Drop each table
            for (const table of tables) {
                await db.run(`DROP TABLE IF EXISTS ${table.name}`);
                log.info(`Dropped table: ${table.name}`);
            }
            log.info('Database reset complete');
        }
        */
        // --------------------------------------------------------
        
        // Read the schema SQL file
        if (fs.existsSync(SCHEMA_PATH)) {
            const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');
            log.info('Read schema.sql file successfully');
            
            // Execute the schema SQL
            await db.exec(schemaSql);
            log.info('Database schema initialized successfully');
        } else {
            log.error(`Schema file not found at: ${SCHEMA_PATH}`);
        }
        
        // Close the database connection
        await db.close();
        return true;
    } catch (error) {
        log.error('Failed to initialize database:', error);
        return false;
    }
}

// Initialize database and then start the server
initializeDatabaseWithSchema()
    .then(success => {
        if (success) {
            app.listen(PORT, () => {
                log.info(`✅ Server running on http://localhost:${PORT}`);
            });
        } else {
            log.error('Server not started due to database initialization failure');
            process.exit(1);
        }
    })
    .catch(error => {
        log.error('Unexpected error during startup:', error);
        process.exit(1);
    });

app.post('/api/generate-pdf', async (req, res) => {
    const { content } = req.body;
    const requestId = req.headers['x-request-id'] || `req-${Date.now()}`;
  
    try {
      if (!content) {
        return res.status(400).json({ error: 'Content is required', requestId });
      }
  
      const result = await generatePDF({ optimizedPattern: content });
      if (result.success) {
        return res.json({ pdfContent: result.pdfContent, pdfUrl: result.pdfUrl, requestId });
      } else {
        return res.status(400).json({ error: result.error || 'Failed to generate PDF', requestId });
      }
    } catch (error) {
      log.error(`[${requestId}] PDF Generation Error:`, error);
      res.status(500).json({ error: `Failed to generate PDF: ${error.message}`, requestId });
    }
  });

  // Import quota middleware and auth middleware
  import checkQuota from './middleware/checkQuota.js';
  import { verifyToken } from './middleware/auth.js';
  import incrementQuota from './utils/incrementQuota.js';

  app.post('/api/generate-etsy', verifyToken, checkQuota("create-listing"), async (req, res) => {
    log.info("📥 [generate-etsy] Received data:", req.body);
    const { content } = req.body;
    const requestId = req.headers['x-request-id'] || `req-${Date.now()}`;
    try {
      if (!content) {
        return res.status(400).json({ error: 'Content is required', requestId });
      }

      const result = await generateEtsyListing({ pdfContent: content });

      if (result.success) {
        // Increment quota usage after successful listing
        await incrementQuota(req.user.id, "create-listing");
        log.info(`[quota] Incremented usage for user ${req.user.id} — Feature: create-listing`);
        
        // Save the listing to the database
        try {
          await saveListing(req.user.id, {
            title: result.title,
            description: result.description,
            tags: result.tags,
            alt_texts: result.altTexts,
            original_prompt: content,
            platform: 'etsy'
          });
          log.info(`[${requestId}] Successfully saved listing to database`);
        } catch (saveError) {
          log.error(`[${requestId}] Error saving listing:`, saveError);
          // Continue with response even if saving fails
        }
        
        return res.json({ ...result, requestId });
      } else {
        return res.status(400).json({ error: result.error || 'Failed to generate Etsy listing', requestId });
      }
    } catch (error) {
      log.error(`[${requestId}] Etsy Listing Generation Error:`, error);
      res.status(500).json({ error: `Failed to generate Etsy listing: ${error.message}`, requestId });
    }
  });

  // Save a generated listing to the database
  app.post('/api/save-listing', verifyToken, checkQuota("create-listing"), async (req, res) => {
    const requestId = req.headers['x-request-id'] || `req-${Date.now()}`;
    log.info("📥 [save-listing] Received listing payload:", req.body);
    
    try {
      const { title, description, tags, altTexts, originalPrompt } = req.body;
      
      // Validate required fields
      if (!title || !description || !Array.isArray(tags) || !Array.isArray(altTexts) || !originalPrompt) {
        return res.status(400).json({ 
          error: 'Missing required fields. Title, description, tags (array), altTexts (array), and originalPrompt are required.',
          requestId 
        });
      }
      
      // Save listing to database
      const listingId = await saveListing(req.user.id, {
        title,
        description,
        tags,
        alt_texts: altTexts,
        original_prompt: originalPrompt,
        platform: 'etsy'
      });
      
      log.info("✅ [save-listing] Listing saved with title:", title);
      
      // Başarılı işlemden sonra kotayı artır
      await incrementQuota(req.user.id, "create-listing");
      log.info(`[quota] Incremented usage for user ${req.user.id} — Feature: create-listing`);
      
      // Return success response
      return res.status(201).json({ 
        success: true,
        listingId,
        requestId
      });
    } catch (error) {
      log.error("❌ [save-listing] Failed to save listing. Reason:", error.message);
      res.status(500).json({ 
        error: `Failed to save listing: ${error.message}`, 
        requestId 
      });
    }
  });

  /**
   * Process the raw Gemini API response into a format compatible with the existing code
   * @param {Object} apiResponse - Raw response from the Gemini API
   * @param {string} originalPrompt - The original prompt sent to the API
   * @returns {Object} - Processed response in the format expected by the client
   */
  function processGeminiResponse(apiResponse, originalPrompt) {
    log.info("Processing Gemini API response");
    
    // Initialize variables for response processing
    let responseText = "";
    let generatedImage = null;
    
    try {
      // Check if the response contains candidates
      if (apiResponse.candidates && apiResponse.candidates.length > 0) {
        const candidate = apiResponse.candidates[0];
        
        // Extract text and image from the response
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            // Extract text content
            if (part.text) {
              responseText += part.text;
            }
            
            // Extract image content
            if (part.inlineData) {
              generatedImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
          }
        }
        
        // Check if we have an image
        if (!generatedImage) {
          log.warn("Gemini API response did not contain an image");
        }
      } else {
        log.warn("Gemini API response did not contain any candidates");
      }
      
      // Return the processed response
      return {
        success: !!generatedImage,
        image: generatedImage,
        responseText: responseText || "No text response provided",
        message: generatedImage 
          ? "Image edited successfully using Gemini API."
          : "Failed to generate image from Gemini API.",
        originalPrompt
      };
    } catch (error) {
      log.error("Error processing Gemini API response:", error);
      throw new Error(`Error processing Gemini API response: ${error.message}`);
    }
  }
  
  // Image Editing Route - Gemini API implementation
  app.post('/api/edit-image', verifyToken, checkQuota("edit-image"), async (req, res) => {
    const requestId = req.headers['x-request-id'] || `img-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const startTime = Date.now();
    
    // Log initial request details
    const imageSize = req.body.image ? Math.round(req.body.image.length / 1024) : 0;
    log.info(`[${requestId}] Received image edit request - Size: ${imageSize}KB, Time: ${new Date().toISOString()}`);
    
    try {
      const { image, prompt } = req.body;
      
      // Validate request fields
      if (!image) {
        log.info(`[${requestId}] Validation failed: Image is missing from request`);
        return res.status(400).json({
          success: false,
          message: 'Image is required',
          requestId
        });
      }
      
      if (!prompt) {
        log.info(`[${requestId}] Validation failed: Prompt is missing from request`);
        return res.status(400).json({
          success: false,
          message: 'Prompt is required',
          requestId
        });
      }
      
      log.info(`[${requestId}] Validation successful - Prompt: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"`);
      
      // Extract image metadata for logging
      let mimeType = 'unknown';
      if (image.startsWith('data:')) {
        const matches = image.match(/^data:([^;]+);base64,/);
        if (matches && matches.length > 1) {
          mimeType = matches[1];
        }
      }
      log.info(`[${requestId}] Processing image - Type: ${mimeType}, Size: ${imageSize}KB`);
      
      // Call the Gemini API with the image and prompt
      log.info(`[${requestId}] Calling Gemini API with prompt: "${prompt.substring(0, 30)}${prompt.length > 30 ? '...' : ''}"`);
      const apiCallStartTime = Date.now();
      
      try {
        // Extract base64 data and mime type from the data URL
        let base64Data, mimeType;
        if (image.startsWith('data:')) {
          const matches = image.match(/^data:([^;]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            mimeType = matches[1];
            base64Data = matches[2];
          } else {
            throw new Error('Invalid data URL format');
          }
        } else {
          // Assume it's already base64 without the data URL prefix
          base64Data = image;
          mimeType = 'image/jpeg'; // Default to JPEG if not specified
        }

        log.info(`[${requestId}] Desteklenen formatları ve varsayılan değerleri ayarla`);
        const supportedFormats = (process.env.GEMINI_OUTPUT_FORMAT || 'jpeg').split(',');
        const defaultFormat = supportedFormats[0];
        const outputFormat = supportedFormats.includes('jpeg') ? 'jpeg' : defaultFormat;

        // Gemini API'sini doğrudan çağır
        const geminiResponse = await callGeminiApi(image, prompt, {
          outputFormat: outputFormat,
          outputQuality: parseInt(process.env.GEMINI_OUTPUT_QUALITY || '85', 10),
          category: process.env.GEMINI_CATEGORY || 'general',
          generationOptions: {
            temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.1'),
            topP: parseFloat(process.env.GEMINI_TOP_P || '0.3'),
            topK: parseInt(process.env.GEMINI_TOP_K || '20', 10),
            maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '2048', 10),
            stopSequences: [process.env.GEMINI_STOP_SEQUENCES.replace(/\\\\n/g, '\n') || '\n\n']
          }
        });
        const apiCallDuration = Date.now() - apiCallStartTime;
        
        log.info(`[${requestId}] Gemini API call successful - Duration: ${apiCallDuration}ms`);
        log.info(`[${requestId}] Response contains image: ${!!geminiResponse.image}, text: ${!!geminiResponse.responseText}`);
        
        const totalDuration = Date.now() - startTime;
        log.info(`[${requestId}] Sending successful response to client - Total processing time: ${totalDuration}ms`);
        
        // Increment quota after successful image editing
        await incrementQuota(req.user.id, "edit-image");
        log.info(`[quota] Incremented usage for user ${req.user.id} — Feature: edit-image`);
        
        return res.json({
          success: true,
          message: "Image edit successful using Gemini API.",
          originalPrompt: prompt,
          result: geminiResponse,
          requestId,
          processingTime: totalDuration
        });
      } catch (apiError) {
        // Specific logging for Gemini API errors
        const apiErrorStatus = apiError.message.includes('status') ? apiError.message.match(/status (\d+)/)?.[1] || 'unknown' : 'unknown';
        log.error(`[${requestId}] Gemini API Error - Status: ${apiErrorStatus}`);
        log.error(`[${requestId}] Gemini API Error Details:`, apiError.message);
        
        throw apiError; // Re-throw to be caught by the outer catch block
      }
    } catch (error) {
      const totalDuration = Date.now() - startTime;
      log.error(`[${requestId}] Image Edit Error - Duration: ${totalDuration}ms`);
      log.error(`[${requestId}] Error Type: ${error.name}, Message: ${error.message}`);
      
      res.status(500).json({
        success: false,
        message: `Failed to edit image: ${error.message}`,
        requestId,
        processingTime: totalDuration
      });
    }
  });

app.use('/api/ai', aiRoutes);

// Global error handling middleware - must be after all routes
app.use((err, req, res, next) => {
  const requestId = req.requestId || `error-${Date.now()}`;
  
  // Log the error
  log.error(`[${requestId}] Unhandled error:`, {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  // Handle specific error types
  if (err.name === 'JsonWebTokenError') {
    log.auth401(req, 'JWT Error in middleware', { 
      requestId,
      error: err.message 
    });
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      message: 'Authentication failed',
      requestId
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    log.auth401(req, 'Token expired in middleware', { 
      requestId,
      expiredAt: err.expiredAt 
    });
    return res.status(401).json({
      success: false,
      error: 'Token expired',
      message: 'Please login again',
      requestId
    });
  }
  
  // Generic error response
  res.status(err.status || 500).json({
    success: false,
    error: isDevelopment ? err.message : 'Internal Server Error',
    message: 'Something went wrong',
    requestId,
    ...(isDevelopment && { stack: err.stack })
  });
});

// 404 handler for unmatched routes
app.use((req, res) => {
  const requestId = req.requestId || `404-${Date.now()}`;
  
  log.warn(`[${requestId}] 404 - Route not found: ${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: 'The requested resource was not found',
    requestId
  });
});