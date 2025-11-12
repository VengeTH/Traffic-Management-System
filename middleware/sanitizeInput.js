/**
 * Input Sanitization Middleware
 * Sanitizes user input to prevent XSS and injection attacks
 */

const { sanitizeObject, redactSensitive } = require('../utils/sanitize');

/**
 * Middleware to sanitize request body, query, and params
 */
const sanitizeInput = (req, res, next) => {
  // * Sanitize request body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  
  // * Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  
  // * Sanitize route parameters
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  
  next();
};

/**
 * Middleware to sanitize specific fields
 * @param {string[]} fields - Fields to sanitize
 */
const sanitizeFields = (fields = []) => {
  return (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
      for (const field of fields) {
        if (req.body[field] && typeof req.body[field] === 'string') {
          // * Remove HTML tags and escape special characters
          req.body[field] = req.body[field]
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
            .trim();
        }
      }
    }
    next();
  };
};

module.exports = {
  sanitizeInput,
  sanitizeFields
};

