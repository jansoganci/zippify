/**
 * Increment Quota Utility
 * Increments a user's quota usage for a specific feature
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
 * Increment a user's quota usage for a specific feature
 * @param {number} userId - The user's ID
 * @param {string} featureName - The name of the feature
 * @returns {Promise<void>}
 */
export async function incrementQuota(userId, featureName) {
  if (!userId || !featureName) {
    console.error('[quota] Missing userId or featureName for quota increment');
    return;
  }

  try {
    const db = await getDb();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Check if a record exists for today
    const existingRecord = await db.get(
      'SELECT * FROM user_quota WHERE user_id = ? AND feature = ? AND date = ?',
      [userId, featureName, today]
    );
    
    let newCount = 1;
    
    if (existingRecord) {
      // Update existing record
      newCount = existingRecord.request_count + 1;
      await db.run(
        'UPDATE user_quota SET request_count = ? WHERE user_id = ? AND feature = ? AND date = ?',
        [newCount, userId, featureName, today]
      );
    } else {
      // Create new record
      await db.run(
        'INSERT INTO user_quota (user_id, feature, date, request_count) VALUES (?, ?, ?, 1)',
        [userId, featureName, today]
      );
    }
    
    console.log(`[quota] Incremented usage for user ${userId} — Feature: ${featureName} — New count: ${newCount}`);
    
    await db.close();
  } catch (error) {
    console.error('[quota] Error incrementing quota:', error);
  }
}

export default incrementQuota;
