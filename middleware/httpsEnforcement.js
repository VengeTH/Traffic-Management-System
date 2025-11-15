/**
 * HTTPS Enforcement Middleware
 * Enforces HTTPS connections in production
 */

const logger = require('../utils/logger');

/**
 * Middleware to enforce HTTPS in production
 */
const enforceHTTPS = (req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const forceHTTPS = process.env.FORCE_HTTPS === 'true';
  
  // * Skip HTTPS enforcement if explicitly disabled
  if (process.env.FORCE_HTTPS === 'false') {
    return next();
  }
  
  // * Skip HTTPS enforcement for localhost connections
  const hostname = req.get('host')?.split(':')[0] || req.hostname;
  const isLocalhost = hostname === 'localhost' || 
                      hostname === '127.0.0.1' || 
                      hostname === '::1' ||
                      hostname.startsWith('192.168.') ||
                      hostname.startsWith('10.') ||
                      hostname.startsWith('172.');
  
  if (isLocalhost) {
    return next();
  }
  
  // * Only enforce in production or if explicitly enabled
  if (!isProduction && !forceHTTPS) {
    return next();
  }
  
  // * Check if request is already HTTPS
  const isHTTPS = 
    req.secure || // Direct HTTPS connection
    req.headers['x-forwarded-proto'] === 'https' || // Behind proxy
    req.headers['x-forwarded-ssl'] === 'on'; // Alternative header
  
  if (!isHTTPS) {
    // * Redirect to HTTPS
    const httpsUrl = `https://${req.get('host')}${req.originalUrl}`;
    logger.warn('HTTPS redirect', {
      from: req.originalUrl,
      to: httpsUrl,
      ip: req.ip
    });
    return res.redirect(301, httpsUrl);
  }
  
  next();
};

module.exports = {
  enforceHTTPS
};

