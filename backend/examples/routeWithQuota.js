/**
 * Example Route With Quota Management
 * Shows how to use the checkQuota middleware and incrementQuota utility
 */
import express from 'express';
import verifyToken from '../middleware/auth.js';
import checkQuota from '../middleware/checkQuota.js';
import incrementQuota from '../utils/incrementQuota.js';

const router = express.Router();

/**
 * @route   POST /api/some-feature
 * @desc    Example of a route with quota checking and incrementing
 * @access  Private
 */
router.post('/', verifyToken, checkQuota("some-feature"), async (req, res) => {
  try {
    // Get data from request
    const { someData } = req.body;
    
    // Validate required parameters
    if (!someData) {
      return res.status(400).json({ 
        error: 'Required data is missing'
      });
    }
    
    // Process the request (your actual business logic here)
    // ...
    
    // For this example, we'll simulate a successful operation
    const result = { success: true, data: "Operation completed successfully" };
    
    // After successful processing, increment the quota
    await incrementQuota(req.user.id, req.featureName);
    
    // Return success response
    return res.json({
      success: true,
      data: result,
      quotaInfo: req.quotaInfo // Optional: return quota info to client
    });
    
  } catch (error) {
    console.error(`Error processing request:`, error);
    return res.status(500).json({
      error: `Operation failed: ${error.message}`
    });
  }
});

export default router;
