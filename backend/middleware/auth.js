import jwt from 'jsonwebtoken';

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
