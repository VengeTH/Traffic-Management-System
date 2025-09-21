/**
 * Authentication Middleware
 * JWT token verification and user authentication
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

// * Authentication middleware
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        error: 'AUTH_TOKEN_MISSING'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        error: 'AUTH_TOKEN_MISSING'
      });
    }
    
    // * Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // * Find user by ID
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.',
        error: 'AUTH_USER_NOT_FOUND'
      });
    }
    
    // * Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.',
        error: 'AUTH_ACCOUNT_DEACTIVATED'
      });
    }
    
    // * Check if account is locked
    if (user.isLocked()) {
      return res.status(401).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts.',
        error: 'AUTH_ACCOUNT_LOCKED'
      });
    }
    
    // * Add user to request object
    req.user = user;
    req.token = token;
    
    next();
    
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
        error: 'AUTH_INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired.',
        error: 'AUTH_TOKEN_EXPIRED'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Authentication error occurred.',
      error: 'AUTH_ERROR'
    });
  }
};

// * Admin authorization middleware
const adminAuth = async (req, res, next) => {
  try {
    // * First authenticate user
    await auth(req, res, (err) => {
      if (err) return next(err);
    });
    
    // * Check if user is admin
    if (!req.user.canPerformAdminAction()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
        error: 'AUTH_ADMIN_REQUIRED'
      });
    }
    
    next();
    
  } catch (error) {
    logger.error('Admin authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error occurred.',
      error: 'AUTH_ERROR'
    });
  }
};

// * Enforcer authorization middleware
const enforcerAuth = async (req, res, next) => {
  try {
    // * First authenticate user
    await auth(req, res, (err) => {
      if (err) return next(err);
    });
    
    // * Check if user is enforcer or admin
    if (!req.user.canPerformEnforcerAction()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Enforcer privileges required.',
        error: 'AUTH_ENFORCER_REQUIRED'
      });
    }
    
    next();
    
  } catch (error) {
    logger.error('Enforcer authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error occurred.',
      error: 'AUTH_ERROR'
    });
  }
};

// * Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.substring(7);
    
    if (!token) {
      return next();
    }
    
    // * Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // * Find user by ID
    const user = await User.findByPk(decoded.userId);
    
    if (user && user.isActive && !user.isLocked()) {
      req.user = user;
      req.token = token;
    }
    
    next();
    
  } catch (error) {
    // * Don't fail on token errors for optional auth
    logger.debug('Optional authentication error (non-critical):', error);
    next();
  }
};

// * Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// * Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

// * Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  auth,
  adminAuth,
  enforcerAuth,
  optionalAuth,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken
};



