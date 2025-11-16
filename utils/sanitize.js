/**
 * Data Sanitization Utilities
 * Functions to sanitize sensitive data from logs and error messages
 */

// * Patterns to redact
const SENSITIVE_PATTERNS = [
  // * JWT tokens
  /Bearer\s+[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+/gi,
  // * Email addresses (keep domain for debugging)
  /([a-zA-Z0-9._-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
  // * Phone numbers
  /\+?[1-9]\d{1,14}/g,
  // * Credit card numbers
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  // * Driver license numbers
  /\b[A-Z]{1,3}\d{6,12}\b/gi,
  // * Password fields
  /password["\s:=]+([^"'\s,}]+)/gi,
  // * API keys
  /(api[_-]?key|secret[_-]?key|access[_-]?token)["\s:=]+([^"'\s,}]+)/gi,
  // * Database connection strings
  /(postgres|mysql|mongodb):\/\/[^@]+@[^\s"']+/gi,
    // * OVR numbers (Las Piñas City format: LPC-######)
    /LPC-\d{6}/gi,
]

/**
 * Redact sensitive information from a string
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
const redactSensitive = (text) => {
  if (!text || typeof text !== "string") {
    return text
  }

  let sanitized = text

  // * Redact JWT tokens
  sanitized = sanitized.replace(
    /Bearer\s+[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+/gi,
    "Bearer [REDACTED]"
  )

  // * Redact email addresses (keep domain)
  sanitized = sanitized.replace(
    /([a-zA-Z0-9._-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
    "[REDACTED]@$2"
  )

  // * Redact phone numbers
  sanitized = sanitized.replace(/\+?[1-9]\d{1,14}/g, "[REDACTED_PHONE]")

  // * Redact credit card numbers
  sanitized = sanitized.replace(
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    "[REDACTED_CARD]"
  )

  // * Redact driver license numbers (keep first 2 chars)
  sanitized = sanitized.replace(/\b([A-Z]{1,2})\d{6,12}\b/gi, "$1[REDACTED]")

  // * Redact password fields (only match actual field values, not the word "password" in text)
  sanitized = sanitized.replace(
    /["']password["']\s*:\s*["']([^"']+)["']/gi,
    '"password":"[REDACTED]"'
  )
  sanitized = sanitized.replace(/password=([^&\s]+)/gi, "password=[REDACTED]")

  // * Redact API keys
  sanitized = sanitized.replace(
    /(api[_-]?key|secret[_-]?key|access[_-]?token)["\s:=]+([^"'\s,}]+)/gi,
    "$1=[REDACTED]"
  )

  // * Redact database connection strings
  sanitized = sanitized.replace(
    /(postgres|mysql|mongodb):\/\/[^@]+@[^\s"']+/gi,
    "$1://[REDACTED]@[REDACTED]"
  )

  // * Redact OVR numbers (Las Piñas City format: LPC-######)
  sanitized = sanitized.replace(/LPC-(\d{6})/gi, "LPC-[REDACTED]")

  return sanitized
}

/**
 * Sanitize an object by redacting sensitive fields
 * @param {object} obj - Object to sanitize
 * @param {string[]} sensitiveFields - List of field names to redact
 * @returns {object} Sanitized object
 */
const sanitizeObject = (obj, sensitiveFields = []) => {
  if (!obj || typeof obj !== "object") {
    return obj
  }

  const defaultSensitiveFields = [
    "password",
    "token",
    "refreshToken",
    "apiKey",
    "secret",
    "accessToken",
    "authorization",
    "phoneNumber",
    "driverLicenseNumber",
    "creditCard",
    "ssn",
    "email", // * Can be sensitive in some contexts
  ]

  const fieldsToRedact = [...defaultSensitiveFields, ...sensitiveFields]
  const sanitized = { ...obj }

  for (const key in sanitized) {
    if (
      fieldsToRedact.some((field) =>
        key.toLowerCase().includes(field.toLowerCase())
      )
    ) {
      sanitized[key] = "[REDACTED]"
    } else if (typeof sanitized[key] === "string") {
      sanitized[key] = redactSensitive(sanitized[key])
    } else if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key], sensitiveFields)
    }
  }

  return sanitized
}

/**
 * Sanitize error message and stack trace
 * @param {Error} error - Error object to sanitize
 * @returns {object} Sanitized error information
 */
const sanitizeError = (error) => {
  if (!error) {
    return null
  }

  return {
    name: error.name,
    message: redactSensitive(error.message || ""),
    stack: error.stack ? redactSensitive(error.stack) : undefined,
    code: error.code,
    statusCode: error.statusCode,
    error: error.error,
  }
}

module.exports = {
  redactSensitive,
  sanitizeObject,
  sanitizeError,
}
