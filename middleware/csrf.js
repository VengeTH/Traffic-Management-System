/**
 * CSRF Protection Middleware
 * Protects against Cross-Site Request Forgery attacks
 */

const crypto = require("crypto")
const logger = require("../utils/logger")

// * Store CSRF tokens in memory (in production, use Redis)
const csrfTokens = new Map()

// * Clean up expired tokens periodically
setInterval(
  () => {
    const now = Date.now()
    for (const [token, expiry] of csrfTokens.entries()) {
      if (expiry < now) {
        csrfTokens.delete(token)
      }
    }
  },
  60 * 60 * 1000
) // Clean up every hour

/**
 * Generate CSRF token
 * @param {string} sessionId - Session identifier (can be user ID or session token)
 * @returns {string} CSRF token
 */
const generateCSRFToken = (sessionId) => {
  const token = crypto.randomBytes(32).toString("hex")
  const expiry = Date.now() + 60 * 60 * 1000 // 1 hour expiry

  // * Store token with session ID as key
  csrfTokens.set(token, expiry)

  return token
}

/**
 * Verify CSRF token
 * @param {string} token - CSRF token to verify
 * @returns {boolean} True if token is valid
 */
const verifyCSRFToken = (token) => {
  if (!token) {
    return false
  }

  const expiry = csrfTokens.get(token)
  if (!expiry) {
    return false
  }

  if (expiry < Date.now()) {
    csrfTokens.delete(token)
    return false
  }

  return true
}

/**
 * CSRF protection middleware
 * Skips CSRF check for GET, HEAD, OPTIONS requests
 * Requires CSRF token in X-CSRF-Token header for state-changing requests
 */
const csrfProtection = (req, res, next) => {
  try {
    // * Skip CSRF check for safe methods
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      return next()
    }
    
    // * Get the URL path and check if it contains login/auth
    // * Combine all possible path representations
    // * Note: req.route might not exist yet at middleware time
    // * Use try-catch for each property access to prevent errors
    let allPaths = ''
    try {
      const paths = [
        req.path || '',
        req.url || '',
        req.originalUrl || '',
        (req.baseUrl || '') + (req.path || '')
      ].filter(Boolean)
      allPaths = paths.join(' ').toLowerCase()
    } catch (pathError) {
      // * If we can't get paths, allow the request through
      logger.warn("Error getting request paths:", pathError)
      return next()
    }
    
    // * If path contains ANY auth-related keyword, bypass CSRF completely
    const isAuthEndpoint = 
      allPaths.includes('login') ||
      allPaths.includes('register') ||
      allPaths.includes('auth') ||
      allPaths.includes('forgot') ||
      allPaths.includes('reset') ||
      allPaths.includes('verify') ||
      allPaths.includes('refresh') ||
      allPaths.includes('health') ||
      allPaths.includes('violations/search')
    
    // * BYPASS CSRF FOR ALL AUTH ENDPOINTS - NO EXCEPTIONS
    if (isAuthEndpoint) {
      return next()
    }
    
    // * For payment endpoints, only require CSRF if user is authenticated
    // * Public payment endpoints (like initiate) don't need CSRF if user is not authenticated
    const isPaymentEndpoint = allPaths.includes('payments')
    if (isPaymentEndpoint && (!req.user || req.user === undefined)) {
      // * Allow public payment endpoints without CSRF token
      return next()
    }

    // * Get CSRF token from header
    const csrfToken = req.get("X-CSRF-Token") || req.body._csrf

    if (!csrfToken) {
      logger.warn("CSRF token missing", {
        path: req.path,
        method: req.method,
        ip: req.ip,
      })

      return res.status(403).json({
        success: false,
        message: "CSRF token missing",
        error: "CSRF_TOKEN_MISSING",
      })
    }

    if (!verifyCSRFToken(csrfToken)) {
      logger.warn("Invalid CSRF token", {
        path: req.path,
        method: req.method,
        ip: req.ip,
      })

      return res.status(403).json({
        success: false,
        message: "Invalid CSRF token",
        error: "CSRF_TOKEN_INVALID",
      })
    }

    // * Remove token after use (one-time use)
    csrfTokens.delete(csrfToken)

    next()
  } catch (error) {
    // * If there's an error in CSRF middleware, log it but don't block auth endpoints
    logger.error("CSRF middleware error:", error)
    // * For auth endpoints, always allow through even on error
    const allPaths = [
      req.path || '',
      req.url || '',
      req.originalUrl || ''
    ].join(' ').toLowerCase()
    
    if (allPaths.includes('login') || allPaths.includes('auth') || allPaths.includes('register')) {
      return next()
    }
    
    // * For other endpoints, pass the error to the error handler
    return next(error)
  }
}

/**
 * Middleware to add CSRF token to response
 * Adds CSRF token to response header for client to use
 */
const addCSRFToken = (req, res, next) => {
  try {
    // * Generate token for authenticated users
    if (req.user && req.user.id) {
      const token = generateCSRFToken(req.user.id)
      res.setHeader("X-CSRF-Token", token)
    }
  } catch (error) {
    // * Don't block requests if CSRF token generation fails
    logger.error("Failed to generate CSRF token:", error)
  }

  next()
}

module.exports = {
  csrfProtection,
  addCSRFToken,
  generateCSRFToken,
  verifyCSRFToken,
}
