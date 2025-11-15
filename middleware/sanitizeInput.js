/**
 * Input Sanitization Middleware
 * Sanitizes user input to prevent XSS and injection attacks
 */

/**
 * Sanitize a value to prevent XSS attacks
 * @param {*} value - Value to sanitize
 * @returns {*} Sanitized value
 */
const sanitizeValue = (value) => {
  if (typeof value === "string") {
    // * Remove potential XSS vectors but keep valid content
    // * Don't use aggressive sanitization on simple fields like email
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "") // Remove inline event handlers
      .replace(/javascript:/gi, "") // Remove javascript: protocol
      .trim()
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue)
  }

  if (value && typeof value === "object") {
    const sanitized = {}
    for (const key in value) {
      sanitized[key] = sanitizeValue(value[key])
    }
    return sanitized
  }

  return value
}

/**
 * Middleware to sanitize request body, query, and params
 */
const sanitizeInput = (req, res, next) => {
  // * Sanitize request body
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body)
  }

  // * Sanitize query parameters
  if (req.query && typeof req.query === "object") {
    req.query = sanitizeValue(req.query)
  }

  // * Sanitize route parameters
  if (req.params && typeof req.params === "object") {
    req.params = sanitizeValue(req.params)
  }

  next()
}

/**
 * Middleware to sanitize specific fields
 * @param {string[]} fields - Fields to sanitize
 */
const sanitizeFields = (fields = []) => {
  return (req, res, next) => {
    if (req.body && typeof req.body === "object") {
      for (const field of fields) {
        if (req.body[field] && typeof req.body[field] === "string") {
          // * Remove HTML tags and escape special characters
          req.body[field] = req.body[field]
            .replace(/<[^>]*>/g, "") // Remove HTML tags
            .replace(/[<>'"]/g, "") // Remove potentially dangerous characters
            .trim()
        }
      }
    }
    next()
  }
}

module.exports = {
  sanitizeInput,
  sanitizeFields,
}
