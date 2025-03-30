import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

/**
 * Initialize the database connection
 * @returns {Promise<sqlite3.Database>} Database connection
 */
async function getDb() {
  return open({
    filename: '../db/zippify.db',
    driver: sqlite3.Database
  });
}

/**
 * Check if a user has exceeded their daily quota for keyword requests
 * @param {number} userId - The user ID to check
 * @returns {Promise<Object>} Object with allowed status and message
 */
export async function checkUserQuota(userId) {
  const db = await getDb();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  try {
    // Get the user's request count for today
    const userQuota = await db.get(
      'SELECT request_count FROM keyword_requests WHERE user_id = ? AND date = ?',
      [userId, today]
    );
    
    // Define daily limit (can be moved to environment variable or config)
    const DAILY_LIMIT = 5;
    
    // If no record exists or count is below limit, user is allowed to make a request
    if (!userQuota || userQuota.request_count < DAILY_LIMIT) {
      return {
        allowed: true,
        message: 'Request allowed',
        remaining: DAILY_LIMIT - (userQuota?.request_count || 0)
      };
    } else {
      return {
        allowed: false,
        message: `Daily limit of ${DAILY_LIMIT} keyword requests reached. Please try again tomorrow.`,
        remaining: 0
      };
    }
  } catch (error) {
    console.error('Error checking user quota:', error);
    // In case of error, allow the request to proceed
    return {
      allowed: true,
      message: 'Quota check failed, allowing request',
      remaining: null
    };
  }
}

/**
 * Update a user's request count for the current day
 * @param {number} userId - The user ID to update
 * @returns {Promise<void>}
 */
export async function updateUserQuota(userId) {
  const db = await getDb();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  try {
    // Check if a record exists for today
    const existingRecord = await db.get(
      'SELECT * FROM keyword_requests WHERE user_id = ? AND date = ?',
      [userId, today]
    );
    
    if (existingRecord) {
      // Update the existing record
      await db.run(
        'UPDATE keyword_requests SET request_count = request_count + 1 WHERE user_id = ? AND date = ?',
        [userId, today]
      );
    } else {
      // Create a new record
      await db.run(
        'INSERT INTO keyword_requests (user_id, date, request_count) VALUES (?, ?, 1)',
        [userId, today]
      );
    }
    
    console.log(`Updated quota for user ${userId} on ${today}`);
  } catch (error) {
    console.error('Error updating user quota:', error);
    // Log but don't throw to prevent disrupting the main flow
  }
}
