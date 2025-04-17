import express from 'express';
import { getKeywordAnalysis } from '../services/keywordService.js';
import checkQuota from '../../../../middleware/checkQuota.js';
import incrementQuota from '../../../../utils/incrementQuota.js';
import { verifyToken } from '../../../../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/keywords
 * @desc    Get keyword analysis for a product
 * @access  Private
 */
router.get('/', verifyToken, checkQuota("seo-analysis"), async (req, res) => {
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
    
    // User ID is available from JWT token (provided by verifyToken middleware)
    // Quota check is now handled by the checkQuota middleware
    
    // For MVP, return placeholder data
    // In the future, this will call the actual keyword analysis service
    const keywordData = await getKeywordAnalysis(product_name, category);
    
    console.log(`[${requestId}] Successfully processed keyword analysis for: ${product_name}`);
    
    // Increment quota after successful analysis
    await incrementQuota(req.user.id, "seo-analysis");
    console.log(`[quota] Incremented usage for user ${req.user.id} — Feature: seo-analysis`);
    
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
