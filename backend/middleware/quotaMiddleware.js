/**
 * Quota Middleware
 * Provides reusable middleware functions for feature-based quota management
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
 * @param {string} featureName - The name of the feature to check quota for (e.g., "seo", "listing", "image")
 * @returns {Function} Express middleware function
 */
export function checkQuota(featureName) {
  return async (req, res, next) => {
    const requestId = req.headers['x-request-id'] || `quota-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    console.log(`[${requestId}] Checking quota for feature: ${featureName}`);
    
    // Get user ID from JWT token (provided by verifyToken middleware)
    const userId = req.user?.id;
    
    if (!userId) {
      console.error(`[${requestId}] No user ID found in request`);
      return res.status(401).json({
        error: 'Authentication required',
        requestId
      });
    }
    
    const db = await getDb();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    try {
      // Get the user's request count for today and the specific feature
      const userQuota = await db.get(
        'SELECT request_count FROM user_quota WHERE user_id = ? AND feature_name = ? AND date = ?',
        [userId, featureName, today]
      );
      
      // Define daily limit (can be moved to environment variable or config)
      const DAILY_LIMIT = 5;
      
      // If no record exists or count is below limit, user is allowed to make a request
      if (!userQuota || userQuota.request_count < DAILY_LIMIT) {
        console.log(`[${requestId}] Quota check passed for user ${userId}, feature ${featureName}`);
        req.quotaInfo = {
          allowed: true,
          feature: featureName,
          remaining: DAILY_LIMIT - (userQuota?.request_count || 0)
        };
        next();
      } else {
        console.log(`[${requestId}] Quota exceeded for user ${userId}, feature ${featureName}`);
        return res.status(429).json({
          error: `Daily limit of ${DAILY_LIMIT} ${featureName} requests reached. Please try again tomorrow.`,
          remaining: 0,
          requestId
        });
      }
    } catch (error) {
      console.error(`[${requestId}] Error checking quota:`, error);
      // In case of error, allow the request to proceed but log the issue
      req.quotaInfo = {
        allowed: true,
        feature: featureName,
        remaining: null,
        error: error.message
      };
      next();
    }
  };
}

/**
 * Middleware to update a user's quota count for a specific feature
 * @param {string} featureName - The name of the feature to update quota for (e.g., "seo", "listing", "image")
 * @returns {Function} Express middleware function
 */
export function updateQuota(featureName) {
  return async (req, res, next) => {
    const requestId = req.headers['x-request-id'] || `quota-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Get user ID from JWT token (provided by verifyToken middleware)
    const userId = req.user?.id;
    
    if (!userId) {
      console.error(`[${requestId}] No user ID found in request when updating quota`);
      next();
      return;
    }
    
    const db = await getDb();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    try {
      // Check if a record exists for today and the specific feature
      const existingRecord = await db.get(
        'SELECT * FROM user_quota WHERE user_id = ? AND feature_name = ? AND date = ?',
        [userId, featureName, today]
      );
      
      if (existingRecord) {
        // Update the existing record
        await db.run(
          'UPDATE user_quota SET request_count = request_count + 1 WHERE user_id = ? AND feature_name = ? AND date = ?',
          [userId, featureName, today]
        );
      } else {
        // Create a new record
        await db.run(
          'INSERT INTO user_quota (user_id, feature_name, date, request_count) VALUES (?, ?, ?, 1)',
          [userId, featureName, today]
        );
      }
      
      console.log(`[${requestId}] Updated quota for user ${userId}, feature ${featureName} on ${today}`);
    } catch (error) {
      console.error(`[${requestId}] Error updating quota:`, error);
      // Log but don't throw to prevent disrupting the main flow
    }
    
    // Always proceed to the next middleware
    next();
  };
}
