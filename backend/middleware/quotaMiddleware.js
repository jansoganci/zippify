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
    
    // 1. Log when the middleware is triggered, including the feature name
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
    
    // 2. Log the user ID and user plan from req.user
    const userPlan = req.user.plan || 'free';
    console.log(`[CHECK QUOTA] Feature: ${featureName} | User: ${userId} | Plan: ${userPlan}`);
    
    const db = await getDb();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    try {
      // Get the user's request count for today and the specific feature
      const userQuota = await db.get(
        'SELECT request_count FROM user_quota WHERE user_id = ? AND feature_name = ? AND date = ?',
        [userId, featureName, today]
      );
      
      // 3. Log the calculated daily limit (based on plan)
      const DAILY_LIMIT = req.user.plan === 'premium' ? 50 : 5;
      
      // 4. Log the current usage (request_count from the database)
      const currentUsage = userQuota?.request_count || 0;
      
      // 5. Log whether the limit is exceeded or not
      const isExceeded = currentUsage >= DAILY_LIMIT;
      const statusIndicator = isExceeded ? '429 BLOCKED' : 'OK';
      
      console.log(`[CHECK QUOTA] Feature: ${featureName} | User: ${userId} | Plan: ${userPlan} | Limit: ${DAILY_LIMIT} | Usage: ${currentUsage} → ${statusIndicator}`);
      
      // If no record exists or count is below limit, user is allowed to make a request
      if (!isExceeded) {
        // 7. Log that request is within quota
        console.log(`[${requestId}] Quota check passed for user ${userId}, feature ${featureName}`);
        req.quotaInfo = {
          allowed: true,
          feature: featureName,
          remaining: DAILY_LIMIT - currentUsage
        };
        next();
      } else {
        // 6. Log that 429 is being returned
        console.log(`[${requestId}] Quota exceeded for user ${userId}, feature ${featureName} - Returning 429`);
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
    console.log(`[DEBUG] updateQuota middleware executing for ${featureName}`);
    const requestId = req.headers['x-request-id'] || `quota-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Only update quota after successful API operations
    // This middleware should be used after the API response is sent
    res.on('finish', async () => {
      // Only increment quota for successful responses (2xx status codes)
      if (res.statusCode < 200 || res.statusCode >= 300) {
        console.log(`[${requestId}] Skipping quota update for unsuccessful response: ${res.statusCode}`);
        return;
      }
      
      // Get user ID from JWT token (provided by verifyToken middleware)
      const userId = req.user?.id;
      
      if (!userId) {
        console.error(`[${requestId}] No user ID found in request when updating quota`);
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
        
        console.log(`[QUOTA] Updated: ${userId} - ${featureName} on ${today}`);
      } catch (error) {
        console.error(`[${requestId}] Error updating quota:`, error);
        // Log but don't throw to prevent disrupting the main flow
      }
    });
    
    // Always proceed to the next middleware immediately
    next();
  };
}
