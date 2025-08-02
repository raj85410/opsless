import jwt from 'jsonwebtoken';
import { query } from '../database/connection.js';
import { logger } from '../utils/logger.js';

// Verify JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token with Firebase Admin SDK or custom secret
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    
    jwt.verify(token, secret, async (err, decoded) => {
      if (err) {
        logger.error('Token verification failed:', err.message);
        return res.status(403).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      try {
        // Get user from database using Firebase UID
        const result = await query(
          'SELECT * FROM users WHERE firebase_uid = $1',
          [decoded.uid || decoded.firebase_uid]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }

        // Attach user to request object
        req.user = result.rows[0];
        
        // Update last login time
        await query(
          'UPDATE users SET last_login_at = NOW() WHERE id = $1',
          [req.user.id]
        );

        next();
      } catch (dbError) {
        logger.error('Database error during authentication:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Authentication failed'
        });
      }
    });
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // Continue without authentication
    }

    const secret = process.env.JWT_SECRET || 'your-secret-key';
    
    jwt.verify(token, secret, async (err, decoded) => {
      if (err) {
        return next(); // Continue without authentication
      }

      try {
        const result = await query(
          'SELECT * FROM users WHERE firebase_uid = $1',
          [decoded.uid || decoded.firebase_uid]
        );

        if (result.rows.length > 0) {
          req.user = result.rows[0];
        }

        next();
      } catch (dbError) {
        logger.error('Database error during optional authentication:', dbError);
        next(); // Continue without authentication
      }
    });
  } catch (error) {
    logger.error('Optional authentication middleware error:', error);
    next(); // Continue without authentication
  }
};

// Role-based access control
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role || 'developer';
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Project ownership verification
export const requireProjectOwnership = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    const result = await query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Project not found or not owned by user'
      });
    }

    next();
  } catch (error) {
    logger.error('Project ownership verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization failed'
    });
  }
};

// Rate limiting for authentication endpoints
export const authRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
};

// Generate JWT token
export const generateToken = (user) => {
  const payload = {
    uid: user.firebase_uid,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 days
  };

  const secret = process.env.JWT_SECRET || 'your-secret-key';
  return jwt.sign(payload, secret);
};

// Refresh token middleware
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Verify refresh token (implement your refresh token logic here)
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    
    jwt.verify(refreshToken, secret, async (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      // Get user from database
      const result = await query(
        'SELECT * FROM users WHERE firebase_uid = $1',
        [decoded.uid]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = result.rows[0];
      const newToken = generateToken(user);

      res.json({
        success: true,
        data: {
          token: newToken,
          user: {
            id: user.id,
            email: user.email,
            displayName: user.display_name,
            role: user.role
          }
        }
      });
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
}; 