/*import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

export default authenticateToken;*/

// src/middleware/auth.js
/*fall back on
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

export const authenticate = async (req, res, next) => {
  try {
 const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    // Check if user still exists in database
    const result = await query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token is invalid.'
      });
    }

    // Add user info to request object
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authentication failed.'
    });
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user exists (should be set by authenticate middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please authenticate first.'
      });
    }

    // Check if user's role is in the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to access this resource.'
      });
    }

    
    next();
  };
};
*/







// src/middleware/auth.js
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

export const authenticate = async (req, res, next) => {
  try {
    console.log("🔐 AUTHENTICATION STARTED");
    console.log("📨 Authorization header:", req.header('Authorization') ? "Present" : "Missing");
    
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("❌ No Bearer token found in header");
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log("🔑 Token extracted (first 20 chars):", token.substring(0, 20) + "...");
    
    if (!token) {
      console.log("❌ Token is empty after extraction");
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    console.log("🔍 Verifying JWT token...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    console.log("✅ Token verified. Decoded payload:", {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      iat: decoded.iat,
      exp: decoded.exp
    });

    // Check if user still exists in database
    console.log("👤 Fetching user from database with ID:", decoded.userId);
    const result = await query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      console.log("❌ User not found in database for ID:", decoded.userId);
      return res.status(401).json({
        success: false,
        message: 'User not found. Token is invalid.'
      });
    }

    const user = result.rows[0];
    console.log("✅ User found in database:", {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    // IMPORTANT: Create req.user object with ALL needed properties
    // This should match what your upload controller expects
    req.user = {
      // Use the ID from database (most reliable)
      userId: user.id,
      // Include both decoded and database values
      id: user.id, // Alternative for compatibility
      user_id: user.id, // Alternative for compatibility
      name: user.name,
      email: user.email,
      role: user.role,
      // Include decoded token data too (for backward compatibility)
      ...decoded
    };

    console.log("✅ Authentication successful. req.user object:", {
      userId: req.user.userId,
      email: req.user.email,
      role: req.user.role
    });

    next();
  } catch (error) {
    console.error('❌ AUTHENTICATION ERROR:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    if (error.name === 'JsonWebTokenError') {
      console.error('❌ JWT Error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      console.error('❌ Token expired at:', new Date(error.expiredAt));
      return res.status(401).json({
        success: false,
        message: 'Token has expired.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired.'
      });
    }

    // Database connection error
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Database connection refused');
      return res.status(503).json({
        success: false,
        message: 'Database unavailable. Please try again later.'
      });
    }

    console.error('❌ Unexpected authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed.'
    });
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    console.log("🔒 AUTHORIZATION CHECK");
    console.log("User role:", req.user?.role);
    console.log("Allowed roles:", allowedRoles);
    
    // Check if user exists (should be set by authenticate middleware)
    if (!req.user) {
      console.log("❌ No user object found. Did authenticate middleware run?");
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please authenticate first.'
      });
    }

    // Check if user's role is in the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      console.log(`❌ User role '${req.user.role}' not in allowed roles:`, allowedRoles);
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to access this resource.'
      });
    }

    console.log("✅ Authorization granted for role:", req.user.role);
    next();
  };
};

// Optional: Add a simple middleware to debug user object on specific routes
export const debugUser = (req, res, next) => {
  console.log("👤 DEBUG USER MIDDLEWARE");
  console.log("Full req.user object:", req.user);
  console.log("req.user.userId:", req.user?.userId);
  console.log("req.user.id:", req.user?.id);
  console.log("req.user.user_id:", req.user?.user_id);
  console.log("req.user.email:", req.user?.email);
  console.log("req.user.role:", req.user?.role);
  next();
};