/**
 * Authentication Routes
 * Defines API endpoints for user authentication
 */
import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';

// Create Express router
const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Login an existing user
 * @access  Public
 */
router.post('/login', loginUser);

// Export the router
export default router;
