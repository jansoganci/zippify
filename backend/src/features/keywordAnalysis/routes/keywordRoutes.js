import express from 'express';
import { getKeywordAnalysis } from '../services/keywordService.js';
import { checkUserQuota, updateUserQuota } from '../utils/quotaManager.js';
import verifyToken from '../../../../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/keywords
 * @desc    Get keyword analysis for a product
 * @access  Private
 */
router.get('/', verifyToken, async (req, res) => {
  const requestId = `kw-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  console.log(`[${requestId}] Received keyword analysis request`);
  
  try {
    const { product_name, category } = req.query;
    
    // Validate required parameters
    if (!product_name) {
      console.log(`[${requestId}] Missing required parameter: product_name`);
      return res.status(400).json({ 
        error: 'Product name is required',
        requestId
      });
    }
    
    // Get user ID from JWT token (provided by verifyToken middleware)
    const userId = req.user.id;
    
    // Check if user has exceeded their quota
    const quotaCheck = await checkUserQuota(userId);
    if (!quotaCheck.allowed) {
      console.log(`[${requestId}] User ${userId} has exceeded their quota: ${quotaCheck.message}`);
      return res.status(429).json({
        error: quotaCheck.message,
        requestId
      });
    }
    
    // For MVP, return placeholder data
    // In the future, this will call the actual keyword analysis service
    const keywordData = await getKeywordAnalysis(product_name, category);
    
    // Update user quota after successful request
    await updateUserQuota(userId);
    
    console.log(`[${requestId}] Successfully processed keyword analysis for: ${product_name}`);
    return res.json({
      data: keywordData,
      requestId
    });
    
  } catch (error) {
    console.error(`[${requestId}] Keyword Analysis Error:`, error);
    return res.status(500).json({
      error: `Failed to analyze keywords: ${error.message}`,
      requestId
    });
  }
});

export default router;
