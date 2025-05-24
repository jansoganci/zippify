/**
 * Advanced Keyword Analysis Routes
 * Provides REST API endpoints for Google Trends-powered keyword analysis
 */
import express from 'express';
import jwt from 'jsonwebtoken';
import { 
  getAdvancedKeywordAnalysis, 
  getBatchKeywordAnalysis,
  checkUserQuota,
  cleanupExpiredCache
} from '../services/googleTrendsService.js';

const router = express.Router();

/**
 * JWT Authentication Middleware
 * Extracts user ID and plan from JWT token
 */
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Access token required' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      plan: decoded.plan || 'free'
    };
    next();
  } catch (error) {
    console.error('[AdvancedKeywords] JWT verification failed:', error);
    return res.status(403).json({ 
      success: false, 
      error: 'Invalid or expired token' 
    });
  }
};

/**
 * Request validation middleware
 */
const validateKeywordRequest = (req, res, next) => {
  const { keyword } = req.body;

  if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Keyword is required and must be a non-empty string'
    });
  }

  if (keyword.trim().length > 100) {
    return res.status(400).json({
      success: false,
      error: 'Keyword must not exceed 100 characters'
    });
  }

  // Sanitize the keyword
  req.body.keyword = keyword.trim();
  next();
};

/**
 * Batch request validation middleware
 */
const validateBatchRequest = (req, res, next) => {
  const { keywords } = req.body;

  if (!Array.isArray(keywords) || keywords.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Keywords must be a non-empty array'
    });
  }

  if (keywords.length > 10) {
    return res.status(400).json({
      success: false,
      error: 'Maximum 10 keywords allowed per batch request'
    });
  }

  // Validate each keyword
  for (let i = 0; i < keywords.length; i++) {
    const keyword = keywords[i];
    if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: `Invalid keyword at index ${i}: must be a non-empty string`
      });
    }
    if (keyword.trim().length > 100) {
      return res.status(400).json({
        success: false,
        error: `Keyword at index ${i} must not exceed 100 characters`
      });
    }
  }

  // Sanitize keywords
  req.body.keywords = keywords.map(k => k.trim());
  next();
};

/**
 * POST /api/advanced-keywords/analyze
 * Analyze a single keyword using Google Trends
 * 
 * Request body:
 * {
 *   "keyword": "example keyword",
 *   "geo": "US" (optional)
 * }
 */
router.post('/analyze', authenticateToken, validateKeywordRequest, async (req, res) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.log(`[${requestId}] Advanced keyword analysis request from user ${req.user.id}`);

  try {
    const { keyword, geo } = req.body;
    const { id: userId, plan: userPlan } = req.user;

    console.log(`[${requestId}] Analyzing keyword: "${keyword}" for user ${userId} (${userPlan} plan)`);

    const startTime = Date.now();
    const analysis = await getAdvancedKeywordAnalysis(
      keyword, 
      userId, 
      userPlan, 
      { geo: geo || 'US' }
    );
    const processingTime = Date.now() - startTime;

    console.log(`[${requestId}] Analysis completed in ${processingTime}ms`);

    res.json({
      success: true,
      data: analysis,
      meta: {
        requestId,
        processingTimeMs: processingTime,
        fromCache: analysis.fromCache,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error(`[${requestId}] Analysis failed:`, error);

    // Handle specific error types
    if (error.message.includes('quota exceeded')) {
      return res.status(429).json({
        success: false,
        error: error.message,
        errorType: 'QUOTA_EXCEEDED',
        meta: { requestId }
      });
    }

    if (error.message.includes('timeout')) {
      return res.status(408).json({
        success: false,
        error: error.message,
        errorType: 'REQUEST_TIMEOUT',
        meta: { requestId }
      });
    }

    if (error.message.includes('Rate limit exceeded')) {
      return res.status(429).json({
        success: false,
        error: error.message,
        errorType: 'RATE_LIMIT_EXCEEDED',
        meta: { requestId }
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      error: 'Failed to analyze keyword',
      details: error.message,
      errorType: 'INTERNAL_ERROR',
      meta: { requestId }
    });
  }
});

/**
 * POST /api/advanced-keywords/batch
 * Analyze multiple keywords using Google Trends
 * 
 * Request body:
 * {
 *   "keywords": ["keyword1", "keyword2", "keyword3"],
 *   "geo": "US" (optional)
 * }
 */
router.post('/batch', authenticateToken, validateBatchRequest, async (req, res) => {
  const requestId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.log(`[${requestId}] Batch keyword analysis request from user ${req.user.id}`);

  try {
    const { keywords, geo } = req.body;
    const { id: userId, plan: userPlan } = req.user;

    console.log(`[${requestId}] Analyzing ${keywords.length} keywords for user ${userId} (${userPlan} plan)`);

    const startTime = Date.now();
    const batchResults = await getBatchKeywordAnalysis(
      keywords, 
      userId, 
      userPlan, 
      { geo: geo || 'US' }
    );
    const processingTime = Date.now() - startTime;

    console.log(`[${requestId}] Batch analysis completed in ${processingTime}ms`);

    res.json({
      success: true,
      data: batchResults,
      meta: {
        requestId,
        processingTimeMs: processingTime,
        totalRequested: keywords.length,
        totalSuccessful: batchResults.totalSuccessful,
        totalErrors: batchResults.totalErrors,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error(`[${requestId}] Batch analysis failed:`, error);

    // Handle specific error types
    if (error.message.includes('Not enough quota')) {
      return res.status(429).json({
        success: false,
        error: error.message,
        errorType: 'INSUFFICIENT_QUOTA',
        meta: { requestId }
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      error: 'Failed to analyze keywords',
      details: error.message,
      errorType: 'INTERNAL_ERROR',
      meta: { requestId }
    });
  }
});

/**
 * GET /api/advanced-keywords/quota
 * Get current user's quota status
 */
router.get('/quota', authenticateToken, async (req, res) => {
  const requestId = `quota_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const { id: userId, plan: userPlan } = req.user;
    
    const quotaStatus = await checkUserQuota(userId, userPlan);
    
    res.json({
      success: true,
      data: {
        currentUsage: quotaStatus.currentUsage,
        limit: quotaStatus.limit,
        remaining: quotaStatus.limit - quotaStatus.currentUsage,
        percentage: Math.round((quotaStatus.currentUsage / quotaStatus.limit) * 100),
        plan: userPlan,
        resetDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Tomorrow
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error(`[${requestId}] Quota check failed:`, error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to check quota',
      details: error.message,
      meta: { requestId }
    });
  }
});

/**
 * POST /api/advanced-keywords/cache/cleanup
 * Manual cache cleanup (admin endpoint)
 */
router.post('/cache/cleanup', authenticateToken, async (req, res) => {
  const requestId = `cleanup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    // Only allow admin users (you can modify this logic based on your admin system)
    if (req.user.plan !== 'admin' && req.user.email !== 'admin@listify.digital') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
        meta: { requestId }
      });
    }

    console.log(`[${requestId}] Manual cache cleanup requested by ${req.user.email}`);
    
    await cleanupExpiredCache();
    
    res.json({
      success: true,
      message: 'Cache cleanup completed',
      meta: {
        requestId,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error(`[${requestId}] Cache cleanup failed:`, error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup cache',
      details: error.message,
      meta: { requestId }
    });
  }
});

/**
 * GET /api/advanced-keywords/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Advanced Keyword Analysis',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

/**
 * GET /api/advanced-keywords/test-status
 * Debug endpoint for testing system status
 */
router.get('/test-status', (req, res) => {
  res.json({
    success: true,
    status: 'Advanced Keywords API is working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    endpoints: {
      analyze: 'POST /api/advanced-keywords/analyze',
      batch: 'POST /api/advanced-keywords/batch', 
      quota: 'GET /api/advanced-keywords/quota',
      health: 'GET /api/advanced-keywords/health',
      testStatus: 'GET /api/advanced-keywords/test-status'
    },
    testInstructions: {
      step1: 'Navigate to http://localhost:8080',
      step2: 'Login with your account',
      step3: 'Click "Advanced Keywords" in sidebar',
      step4: 'Enter keyword "coffee" and click Analyze',
      step5: 'Check if results appear within 15 seconds'
    }
  });
});

console.log('[AdvancedKeywords] Routes initialized');

export default router; 