/**
 * Profile Controller
 * Handles user profile operations
 */
import dbPromise from '../db.js';
import log from '../utils/logger.js';

/**
 * Get the current user's profile
 * @param {Object} req - Express request object (contains user from auth middleware)
 * @param {Object} res - Express response object
 * @returns {Object} Response with user profile data
 */
export const getCurrentUser = async (req, res) => {
  const requestId = req.headers['x-request-id'] || `profile-${Date.now()}`;
  log.info(`[${requestId}] Getting current user profile`);
  
  try {
    const db = await dbPromise;
    // The auth middleware already verified the token and added user to req
    const { id } = req.user;
    
    if (!id) {
      log.info(`[${requestId}] Profile retrieval failed: Missing user ID in token`);
      return res.status(400).json({
        success: false,
        message: 'Invalid user data in token',
        requestId
      });
    }
    
    // Get profile from database
    const profile = await db.get(
      'SELECT u.email, p.first_name as firstName, p.last_name as lastName, p.store_name as storeName FROM users u LEFT JOIN profiles p ON u.id = p.user_id WHERE u.id = ?', 
      [id]
    );
    
    if (!profile) {
      log.info(`[${requestId}] Profile not found for user: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
        requestId
      });
    }
    
    log.info(`[${requestId}] Profile retrieved successfully for user: ${id}`);
    
    // Return the user profile data
    return res.status(200).json({
      success: true,
      ...profile,
      requestId
    });
  } catch (error) {
    log.error(`[${requestId}] Profile retrieval error:`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
      error: error.message,
      requestId
    });
  }
};

/**
 * Update the current user's profile
 * @param {Object} req - Express request object (contains user from auth middleware)
 * @param {Object} res - Express response object
 * @returns {Object} Response with updated profile data
 */
export const updateProfile = async (req, res) => {
  const requestId = req.headers['x-request-id'] || `profile-${Date.now()}`;
  log.info(`[${requestId}] Updating user profile`);
  
  // PUT /profile BODY loglama
  console.log("PUT /profile BODY:", req.body);
  
  try {
    const db = await dbPromise;
    // Get user ID from the token (added by auth middleware)
    const { id } = req.user;
    
    if (!id) {
      log.info(`[${requestId}] Profile update failed: Missing user ID in token`);
      return res.status(400).json({
        success: false,
        message: 'Invalid user data in token',
        requestId
      });
    }
    
    // Extract profile data from request body
    const { firstName, lastName, storeName } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName) {
      log.info(`[${requestId}] Profile update failed: Missing required fields`);
      return res.status(400).json({
        success: false,
        message: 'First name and last name are required',
        requestId
      });
    }
    
    // Check if profile exists
    const existingProfile = await db.get('SELECT * FROM profiles WHERE user_id = ?', [id]);
    
    if (existingProfile) {
      // Update existing profile
      await db.run(
        'UPDATE profiles SET first_name = ?, last_name = ?, store_name = ? WHERE user_id = ?',
        [firstName, lastName, storeName || '', id]
      );
      log.info(`[${requestId}] Profile updated successfully for user: ${id}`);
    } else {
      // Create new profile if it doesn't exist
      await db.run(
        'INSERT INTO profiles (user_id, first_name, last_name, store_name) VALUES (?, ?, ?, ?)',
        [id, firstName, lastName, storeName || '']
      );
      log.info(`[${requestId}] New profile created for user: ${id}`);
    }
    
    // Get the updated profile
    const updatedProfile = await db.get(
      'SELECT u.email, p.first_name as firstName, p.last_name as lastName, p.store_name as storeName FROM users u LEFT JOIN profiles p ON u.id = p.user_id WHERE u.id = ?', 
      [id]
    );
    
    // Return the updated profile data
    return res.status(200).json({
      success: true,
      ...updatedProfile,
      requestId
    });
  } catch (error) {
    log.error(`[${requestId}] Profile update error:`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
      requestId
    });
  }
};
