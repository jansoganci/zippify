/**
 * Authentication Controller
 * Handles user registration and login
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, getUserByEmail } from '../models/userModel.js';

// JWT configuration
if (!process.env.JWT_SECRET) {
  throw new Error('.env yok: JWT_SECRET environment variable is not defined');
}

if (!process.env.JWT_EXPIRY) {
  throw new Error('.env yok: JWT_EXPIRY environment variable is not defined');
}

// Use environment variables directly without fallbacks
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY;

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with token and user data
 */
export async function registerUser(req, res) {
  const requestId = req.headers['x-request-id'] || `auth-${Date.now()}`;
  console.log(`[${requestId}] Processing registration request`);
  
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      console.log(`[${requestId}] Registration failed: Missing required fields`);
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        requestId
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log(`[${requestId}] Registration failed: Invalid email format`);
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
        requestId
      });
    }
    
    // Validate password strength
    if (password.length < 8) {
      console.log(`[${requestId}] Registration failed: Password too short`);
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
        requestId
      });
    }
    
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      console.log(`[${requestId}] Registration failed: Email already in use`);
      return res.status(409).json({
        success: false,
        message: 'Email is already registered',
        requestId
      });
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(12); // Using 12 rounds as per security framework
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create the user
    const newUser = await createUser(email, hashedPassword);
    console.log(`[${requestId}] User created successfully with ID: ${newUser.id}`);
    
    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );
    
    // Return success response
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        created_at: newUser.created_at
      },
      requestId
    });
  } catch (error) {
    console.error(`[${requestId}] Registration error:`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
      requestId
    });
  }
}

/**
 * Login an existing user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with token and user data
 */
export async function loginUser(req, res) {
  const requestId = req.headers['x-request-id'] || `auth-${Date.now()}`;
  console.log(`[${requestId}] Processing login request`);
  
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      console.log(`[${requestId}] Login failed: Missing required fields`);
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        requestId
      });
    }
    
    // Get user by email
    const user = await getUserByEmail(email);
    if (!user) {
      console.log(`[${requestId}] Login failed: User not found`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        requestId
      });
    }
    
    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log(`[${requestId}] Login failed: Invalid password`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        requestId
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );
    
    console.log(`[${requestId}] User logged in successfully: ${user.id}`);
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      requestId
    });
  } catch (error) {
    console.error(`[${requestId}] Login error:`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
      requestId
    });
  }
}
