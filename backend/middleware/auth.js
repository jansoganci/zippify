import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file path and directory (ES Module compatible way)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables directly in the middleware
const envPath = path.resolve(__dirname, '..', '.env');
console.log(`[auth.js] Attempting to load .env from: ${envPath}`);

try {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error(`[auth.js] Error loading .env file: ${result.error.message}`);
  } else {
    console.log(`[auth.js] Successfully loaded environment variables from ${envPath}`);
  }
} catch (error) {
  console.error(`[auth.js] Exception loading .env file: ${error.message}`);
}

// If JWT_SECRET is not defined, try to load from parent directory
if (!process.env.JWT_SECRET) {
  const parentEnvPath = path.resolve(__dirname, '..', '..', '.env');
  console.log(`[auth.js] Trying parent directory .env: ${parentEnvPath}`);
  try {
    dotenv.config({ path: parentEnvPath, override: true });
  } catch (error) {
    console.error(`[auth.js] Failed to load from parent directory: ${error.message}`);
  }
}

// Check if JWT_SECRET is defined after loading attempts
if (!process.env.JWT_SECRET) {
  throw new Error('.env yok: JWT_SECRET environment variable is not defined');
}

/**
 * Middleware to verify JWT token and protect routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const verifyToken = (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.headers['authorization'];
  
  // Check if Authorization header exists and has the Bearer format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Access denied. No token provided or invalid format.',
      message: 'Authentication required'
    });
  }
  
  // Extract the token (remove "Bearer " prefix)
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify the token using the JWT_SECRET environment variable
    // No fallback - will throw an error if JWT_SECRET is not defined
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Set the user information in the request object
    req.user = decoded;
    
    // Proceed to the next middleware/route handler
    next();
  } catch (error) {
    // Return 403 Forbidden if token is invalid
    return res.status(403).json({ 
      error: 'Invalid or expired token.',
      message: 'Authentication failed'
    });
  }
};

export default verifyToken;
