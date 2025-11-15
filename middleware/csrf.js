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

  // * Skip CSRF check for public endpoints that don't modify state
  // * Note: req.path doesn't include the mount point, so paths start without /api
  const publicEndpoints = [
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/verify-email",
    "/auth/refresh",
    "/violations/search",
    "/health",
    // * API v1 endpoints
    "/v1/auth/login",
    "/v1/auth/register",
    "/v1/auth/forgot-password",
    "/v1/auth/reset-password",
    "/v1/auth/verify-email",
    "/v1/auth/refresh",
    "/v1/violations/search",
  ]

  if (publicEndpoints.some((endpoint) => req.path.startsWith(endpoint))) {
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
