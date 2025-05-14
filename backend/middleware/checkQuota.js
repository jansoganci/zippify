/**
 * Check Quota Middleware
 * Checks if a user has exceeded their daily quota for a specific feature
 * Does NOT increment the quota - only checks it
 */
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

/**
 * Initialize the database connection
 * @returns {Promise<sqlite3.Database>} Database connection
 */
async function getDb() {
  return open({
    filename: './db/zippify.db',
    driver: sqlite3.Database
  });
}

/**
 * Middleware to check if a user has exceeded their daily quota for a specific feature
 * @param {string} featureName - The name of the feature to check quota for
 * @returns {Function} Express middleware function
 */
export default function checkQuota(featureName) {
  return async (req, res, next) => {
    // Set the feature name on the request object
    req.featureName = featureName;
    
    // Get user ID from JWT token (provided by auth middleware)
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }
    
    try {
      const db = await getDb();
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Get the user's request count for today and the specific feature
      const userQuota = await db.get(
        'SELECT request_count FROM user_quota WHERE user_id = ? AND feature = ? AND date = ?',
        [userId, featureName, today]
      );
      
      // Define daily limit based on user's plan and feature
      const LIMITS = {
        "create-listing": { free: 5, premium: 50 },
        "edit-image": { free: 5, premium: 50 },
        "seo-analysis": { free: 5, premium: 50 }
      };

      const userPlan = req.user.plan === "premium" ? "premium" : "free";
      const featureLimits = LIMITS[featureName] || { free: 20, premium: 200 };
      const DAILY_LIMIT = featureLimits[userPlan];
      
      // Calculate current usage and remaining quota
      const currentUsage = userQuota?.request_count || 0;
      const remaining = DAILY_LIMIT - currentUsage;
      
      // Log remaining quota
      console.log(`[quota] User: ${userId} — Feature: ${featureName} — Remaining: ${remaining}/${DAILY_LIMIT}`);
      
      // Check if quota is exceeded
      if (currentUsage >= DAILY_LIMIT) {
        return res.status(403).json({
          error: `Daily limit exceeded for ${featureName}`,
          message: `You have reached your daily limit of ${DAILY_LIMIT} ${featureName} requests for your ${userPlan} plan. Your quota will reset tomorrow or you can upgrade to a premium plan for higher limits.`,
          quota: {
            limit: DAILY_LIMIT,
            used: currentUsage,
            remaining: 0,
            feature: featureName,
            plan: userPlan
          }
        });
      }
      
      // Store quota info in request object for potential later use
      req.quotaInfo = {
        limit: DAILY_LIMIT,
        used: currentUsage,
        remaining: remaining
      };
      
      // Allow the request to continue
      next();
    } catch (error) {
      console.error(`Error checking quota:`, error);
      // Hata durumunda, güvenli tarafta kal ve isteği reddet
      return res.status(500).json({
        error: 'Quota check failed, please try again later',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
}
