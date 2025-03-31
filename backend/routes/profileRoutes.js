/**
 * Profile Routes
 * Defines API endpoints for user profile operations
 */
import express from 'express';
import { getCurrentUser } from '../controllers/profileController.js';
import verifyToken from '../middleware/auth.js';

// Create Express router
const router = express.Router();

/**
 * @route   GET /api/profile
 * @desc    Get current user profile
 * @access  Private (requires authentication)
 */
router.get('/', verifyToken, getCurrentUser);

// Export the router
export default router;
