/**
 * Profile Controller
 * Handles user profile operations
 */

/**
 * Get the current user's profile
 * @param {Object} req - Express request object (contains user from auth middleware)
 * @param {Object} res - Express response object
 * @returns {Object} Response with user profile data
 */
export const getCurrentUser = (req, res) => {
  const requestId = req.headers['x-request-id'] || `profile-${Date.now()}`;
  console.log(`[${requestId}] Getting current user profile`);
  
  try {
    // The auth middleware already verified the token and added user to req
    // We just need to return the user data from the token
    const { id, email } = req.user;
    
    if (!id || !email) {
      console.log(`[${requestId}] Profile retrieval failed: Missing user data in token`);
      return res.status(400).json({
        success: false,
        message: 'Invalid user data in token',
        requestId
      });
    }
    
    console.log(`[${requestId}] Profile retrieved successfully for user: ${id}`);
    
    // Return the user profile data
    return res.status(200).json({
      success: true,
      id,
      email,
      requestId
    });
  } catch (error) {
    console.error(`[${requestId}] Profile retrieval error:`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
      error: error.message,
      requestId
    });
  }
};
