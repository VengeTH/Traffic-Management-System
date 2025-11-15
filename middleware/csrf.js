/**
 * CSRF Protection Middleware
 * Protects against Cross-Site Request Forgery attacks
 */

const crypto = require('crypto');
const logger = require('../utils/logger');

// * Store CSRF tokens in memory (in production, use Redis)
const csrfTokens = new Map();

// * Clean up expired tokens periodically
setInterval(() => {
  const now = Date.now();
  for (const [token, expiry] of csrfTokens.entries()) {
    if (expiry < now) {
      csrfTokens.delete(token);
    }
  }
}, 60 * 60 * 1000); // Clean up every hour

/**
 * Generate CSRF token
 * @param {string} sessionId - Session identifier (can be user ID or session token)
 * @returns {string} CSRF token
 */
const generateCSRFToken = (sessionId) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiry = Date.now() + (60 * 60 * 1000); // 1 hour expiry
  
  // * Store token with session ID as key
  csrfTokens.set(token, expiry);
  
  return token;
};

/**
 * Verify CSRF token
 * @param {string} token - CSRF token to verify
 * @returns {boolean} True if token is valid
 */
const verifyCSRFToken = (token) => {
  if (!token) {
    return false;
  }
  
  const expiry = csrfTokens.get(token);
  if (!expiry) {
    return false;
  }
  
  if (expiry < Date.now()) {
    csrfTokens.delete(token);
    return false;
  }
  
  return true;
};

/**
 * CSRF protection middleware
 * Skips CSRF check for GET, HEAD, OPTIONS requests
 * Requires CSRF token in X-CSRF-Token header for state-changing requests
 */
const csrfProtection = (req, res, next) => {
  // * Skip CSRF check for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // * Debug: Log the request path for troubleshooting
  const requestPath = req.path || req.url?.split('?')[0] || '';
  logger.debug('CSRF check', {
    method: req.method,
    path: requestPath,
    originalUrl: req.originalUrl,
    url: req.url
  });
  
  // * Skip CSRF check for public endpoints that don't modify state
  // * Support both versioned (/api/v1/auth/login) and non-versioned (/api/auth/login) endpoints
  const publicEndpointPatterns = [
    '/api/auth/login',
    '/api/v1/auth/login',
    '/api/v2/auth/login',
    '/api/auth/register',
    '/api/v1/auth/register',
    '/api/v2/auth/register',
    '/api/auth/forgot-password',
    '/api/v1/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/v1/auth/reset-password',
    '/api/auth/verify-email',
    '/api/v1/auth/verify-email',
    '/api/auth/refresh',
    '/api/v1/auth/refresh',
    '/api/violations/search',
    '/api/v1/violations/search',
    '/api/health',
    '/api/v1/health'
  ];
  
  // * Check if path matches any public endpoint pattern
  if (publicEndpointPatterns.some(endpoint => requestPath.startsWith(endpoint))) {
    logger.debug('CSRF check passed - public endpoint', { path: requestPath });
    return next();
  }
  
  // * Also check for versioned endpoints using regex pattern
  // * Matches /api/v1/auth/login, /api/v2/auth/login, etc.
  const versionedPublicPattern = /^\/api\/v\d+\/(auth\/(login|register|forgot-password|reset-password|verify-email|refresh)|violations\/search|health)/;
  if (versionedPublicPattern.test(requestPath)) {
    logger.debug('CSRF check passed - versioned public endpoint', { path: requestPath });
    return next();
  }
  
  // * Get CSRF token from header
  const csrfToken = req.get('X-CSRF-Token') || req.body._csrf;
  
  if (!csrfToken) {
    logger.warn('CSRF token missing', {
      path: req.path,
      method: req.method,
      ip: req.ip
    });
    
    return res.status(403).json({
      success: false,
      message: 'CSRF token missing',
      error: 'CSRF_TOKEN_MISSING'
    });
  }
  
  if (!verifyCSRFToken(csrfToken)) {
    logger.warn('Invalid CSRF token', {
      path: req.path,
      method: req.method,
      ip: req.ip
    });
    
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token',
      error: 'CSRF_TOKEN_INVALID'
    });
  }
  
  // * Remove token after use (one-time use)
  csrfTokens.delete(csrfToken);
  
  next();
};

/**
 * Middleware to add CSRF token to response
 * Adds CSRF token to response header for client to use
 */
const addCSRFToken = (req, res, next) => {
  // * Generate token for authenticated users
  if (req.user) {
    const token = generateCSRFToken(req.user.id);
    res.setHeader('X-CSRF-Token', token);
  }
  
  next();
};

module.exports = {
  csrfProtection,
  addCSRFToken,
  generateCSRFToken,
  verifyCSRFToken
};

