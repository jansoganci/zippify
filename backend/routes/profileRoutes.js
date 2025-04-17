/**
 * Profile Routes
 * Defines API endpoints for user profile operations
 */
import express from 'express';
import { getCurrentUser, updateProfile } from '../controllers/profileController.js';
import { verifyToken } from '../middleware/auth.js';

// Create Express router
const router = express.Router();

/**
 * @route   GET /api/profile
 * @desc    Get current user profile
 * @access  Private (requires authentication)
 */
router.get('/', verifyToken, getCurrentUser);

/**
 * @route   PUT /api/profile
 * @desc    Update current user profile
 * @access  Private (requires authentication)
 */
router.put('/', verifyToken, updateProfile);

// Export the router
export default router;
