/**
 * Request ID Middleware
 * Adds unique request ID to each request for tracing security incidents
 */

const { v4: uuidv4 } = require('uuid');

/**
 * Middleware to add request ID to requests
 */
const requestId = (req, res, next) => {
  // * Generate or use existing request ID
  const requestId = req.get('X-Request-ID') || uuidv4();
  
  // * Add to request object
  req.id = requestId;
  
  // * Add to response header
  res.setHeader('X-Request-ID', requestId);
  
  next();
};

module.exports = {
  requestId
};

