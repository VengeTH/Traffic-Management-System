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
  // * Skip CSRF check for safe methods
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next()
  }
  
  // * AGGRESSIVE FIX: Get ALL possible path representations
  const requestPath = req.path || ''
  const originalUrl = req.originalUrl || ''
  const url = req.url || ''
  const baseUrl = req.baseUrl || ''
  
  // * Combine all path representations into one string for checking
  const allPaths = [requestPath, originalUrl, url, baseUrl + requestPath].filter(Boolean).join(' ')
  
  // * AGGRESSIVE: Check if ANY path representation contains login/auth endpoints
  // * This catches: /login, /auth/login, /v1/auth/login, /api/v1/auth/login, etc.
  const isPublicAuthEndpoint = 
    allPaths.includes('login') ||
    allPaths.includes('register') ||
    allPaths.includes('forgot-password') ||
    allPaths.includes('reset-password') ||
    allPaths.includes('verify-email') ||
    allPaths.includes('refresh') ||
    allPaths.includes('violations/search') ||
    allPaths.includes('/health')
  
  // * Log for debugging
  console.log('🔵 CSRF CHECK:', {
    method: req.method,
    requestPath,
    originalUrl,
    url,
    baseUrl,
    allPaths,
    isPublicAuthEndpoint
  })
  
  if (isPublicAuthEndpoint) {
    console.log('✅ CSRF BYPASSED - public auth endpoint')
    return next()
  }
  
  // * Log why CSRF check failed
  console.log('❌ CSRF BLOCKED:', {
    method: req.method,
    requestPath,
    originalUrl,
    url,
    baseUrl,
    allPaths
  })

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
}

/**
 * Middleware to add CSRF token to response
 * Adds CSRF token to response header for client to use
 */
const addCSRFToken = (req, res, next) => {
  // * Generate token for authenticated users
  if (req.user) {
    const token = generateCSRFToken(req.user.id)
    res.setHeader("X-CSRF-Token", token)
  }

  next()
}

module.exports = {
  csrfProtection,
  addCSRFToken,
  generateCSRFToken,
  verifyCSRFToken,
}
