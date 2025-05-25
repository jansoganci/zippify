import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import log from '../utils/logger.js';

// Get the current file path and directory (ES Module compatible way)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables directly in the middleware
const envPath = path.resolve(__dirname, '..', '.env');
log.debug(`[auth.js] Attempting to load .env from: ${envPath}`);

try {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    log.error(`[auth.js] Error loading .env file: ${result.error.message}`);
  } else {
    log.debug(`[auth.js] Successfully loaded environment variables from ${envPath}`);
  }
} catch (error) {
  log.error(`[auth.js] Exception loading .env file: ${error.message}`);
}

// If JWT_SECRET is not defined, try to load from parent directory
if (!process.env.JWT_SECRET) {
  const parentEnvPath = path.resolve(__dirname, '..', '..', '.env');
  log.warn(`[auth.js] Trying parent directory .env: ${parentEnvPath}`);
  try {
    dotenv.config({ path: parentEnvPath, override: true });
  } catch (error) {
    log.error(`[auth.js] Failed to load from parent directory: ${error.message}`);
  }
}

// Check if JWT_SECRET is defined after loading attempts
if (!process.env.JWT_SECRET) {
  log.error('[auth.js] JWT_SECRET environment variable is not defined');
  throw new Error('.env yok: JWT_SECRET environment variable is not defined');
}

log.info('[auth.js] JWT authentication middleware initialized successfully');

/**
 * Middleware to verify JWT token and protect routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
export function verifyToken(req, res, next) {
  const requestId = req.headers['x-request-id'] || `auth-${Date.now()}`;
  
  // Log incoming request
  log.request(req, 'Authentication check started');
  log.auth(`[${requestId}] Starting token verification for ${req.method} ${req.url}`);
  
  // Get the token from the Authorization header
  const authHeader = req.headers['authorization'];
  
  // Check if Authorization header exists and has the Bearer format
  if (!authHeader) {
    log.auth401(req, 'No Authorization header provided', { requestId });
    return res.status(401).json({ 
      error: 'Access denied. No token provided.',
      message: 'Authentication required',
      requestId
    });
  }
  
  if (!authHeader.startsWith('Bearer ')) {
    log.auth401(req, 'Invalid Authorization header format', { 
      requestId,
      authHeader: authHeader.substring(0, 20) + '...'
    });
    return res.status(401).json({ 
      error: 'Access denied. Invalid token format.',
      message: 'Authentication required - Bearer token expected',
      requestId
    });
  }
  
  // Extract the token (remove "Bearer " prefix)
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    log.auth401(req, 'Empty token after Bearer prefix', { requestId });
    return res.status(401).json({ 
      error: 'Access denied. Empty token.',
      message: 'Authentication required',
      requestId
    });
  }
  
  // Log token details (first/last chars only for security)
  log.auth(`[${requestId}] Token received - Length: ${token.length}, Start: ${token.substring(0, 10)}..., End: ...${token.substring(token.length - 10)}`);
  
  try {
    // Verify JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      log.error(`[${requestId}] JWT_SECRET is undefined during token verification`);
      return res.status(500).json({ 
        error: 'Internal server error.',
        message: 'Authentication configuration error',
        requestId
      });
    }
    
    log.debug(`[${requestId}] Using JWT_SECRET (length: ${process.env.JWT_SECRET.length})`);
    
    // Verify the token using the JWT_SECRET environment variable
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    log.auth(`[${requestId}] Token verification successful`, {
      userId: decoded.userId,
      email: decoded.email,
      iat: decoded.iat,
      exp: decoded.exp,
      expiresAt: new Date(decoded.exp * 1000).toISOString()
    });
    
    // Set the user information in the request object
    req.user = decoded;
    req.requestId = requestId;
    
    // Log successful authentication
    log.response(res, 'Authentication successful', {
      requestId,
      userId: decoded.userId,
      endpoint: req.url
    });
    
    // Proceed to the next middleware/route handler
    next();
  } catch (error) {
    // Detailed error logging for different JWT error types
    if (error.name === 'TokenExpiredError') {
      log.auth401(req, 'Token has expired', { 
        requestId,
        expiredAt: error.expiredAt,
        error: error.message
      });
      return res.status(403).json({ 
        error: 'Token has expired.',
        message: 'Please login again',
        requestId
      });
    } else if (error.name === 'JsonWebTokenError') {
      log.auth401(req, 'Invalid token format or signature', { 
        requestId,
        error: error.message
      });
      return res.status(403).json({ 
        error: 'Invalid token.',
        message: 'Authentication failed',
        requestId
      });
    } else if (error.name === 'NotBeforeError') {
      log.auth401(req, 'Token not active yet', { 
        requestId,
        date: error.date,
        error: error.message
      });
      return res.status(403).json({ 
        error: 'Token not active yet.',
        message: 'Authentication failed',
        requestId
      });
    } else {
      log.auth401(req, 'Unknown token verification error', { 
        requestId,
        errorName: error.name,
        error: error.message,
        stack: error.stack
      });
      return res.status(403).json({ 
        error: 'Token verification failed.',
        message: 'Authentication failed',
        requestId
      });
    }
  }
}

/**
 * Middleware to check user quota for specific features
 * @param {string} featureKey - The feature key to check quota for
 * @returns {Function} - Express middleware function
 */
export function checkQuota(featureKey) {
  return async function (req, res, next) {
    const requestId = req.requestId || `quota-${Date.now()}`;
    
    log.quota(featureKey, req.user?.userId || 'unknown', {
      requestId,
      endpoint: req.url,
      method: req.method
    });
    
    // TODO: Add quota checking logic
    log.debug(`[${requestId}] Quota check passed for feature: ${featureKey}`);
    next();
  };
}
