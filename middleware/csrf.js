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
  
  // * Get the full path - req.path is relative to mount point, so use originalUrl or baseUrl + path
  // * Since middleware is mounted at /api/, req.path will be relative to /api/
  // * For /api/v1/auth/login, req.path will be /v1/auth/login
  const requestPath = req.path || req.url?.split('?')[0] || ''
  const fullPath = req.originalUrl?.split('?')[0] || req.baseUrl + requestPath || requestPath
  
  // * Debug: Log the request path for troubleshooting (use info level so it always shows)
  logger.info('CSRF check', {
    method: req.method,
    path: requestPath,
    fullPath: fullPath,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    url: req.url
  })
  
  // * Skip CSRF check for public endpoints that don't modify state
  // * Check both relative path (req.path) and full path (originalUrl)
  // * req.path will be like: /v1/auth/login (relative to /api/ mount point)
  // * fullPath will be like: /api/v1/auth/login (full URL path)
  const publicEndpointPatterns = [
    // Full paths
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
    '/api/v1/health',
    // Relative paths (when mounted at /api/)
    '/auth/login',
    '/v1/auth/login',
    '/v2/auth/login',
    '/auth/register',
    '/v1/auth/register',
    '/v2/auth/register',
    '/auth/forgot-password',
    '/v1/auth/forgot-password',
    '/auth/reset-password',
    '/v1/auth/reset-password',
    '/auth/verify-email',
    '/v1/auth/verify-email',
    '/auth/refresh',
    '/v1/auth/refresh',
    '/violations/search',
    '/v1/violations/search',
    '/health',
    '/v1/health'
  ]
  
  // * Check if path matches any public endpoint pattern (check both relative and full)
  const matchesPublicEndpoint = publicEndpointPatterns.some(endpoint => 
    requestPath.startsWith(endpoint) || fullPath.startsWith(endpoint)
  )
  
  if (matchesPublicEndpoint) {
    logger.info('✅ CSRF check passed - public endpoint', { path: requestPath, fullPath: fullPath })
    return next()
  }
  
  // * Also check for versioned endpoints using regex pattern
  // * Matches /api/v1/auth/login, /api/v2/auth/login, etc. (full path)
  // * Or /v1/auth/login, /v2/auth/login, etc. (relative path)
  const versionedPublicPatternFull = /^\/api\/v\d+\/(auth\/(login|register|forgot-password|reset-password|verify-email|refresh)|violations\/search|health)/
  const versionedPublicPatternRelative = /^\/v\d+\/(auth\/(login|register|forgot-password|reset-password|verify-email|refresh)|violations\/search|health)/
  
  const matchesVersioned = versionedPublicPatternFull.test(fullPath) || versionedPublicPatternRelative.test(requestPath)
  
  if (matchesVersioned) {
    logger.info('✅ CSRF check passed - versioned public endpoint', { path: requestPath, fullPath: fullPath })
    return next()
  }
  
  // * Log why CSRF check failed
  logger.warn('❌ CSRF check failed - endpoint not in public list', {
    path: requestPath,
    fullPath: fullPath,
    method: req.method
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
