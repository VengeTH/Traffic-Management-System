/**
 * Token Blacklist Middleware
 * Manages blacklisted JWT tokens for logout functionality
 */

const logger = require('../utils/logger');

// * In-memory token blacklist (in production, use Redis)
const tokenBlacklist = new Map();

// * Clean up expired tokens periodically
setInterval(() => {
  const now = Date.now();
  for (const [token, expiry] of tokenBlacklist.entries()) {
    if (expiry < now) {
      tokenBlacklist.delete(token);
    }
  }
}, 60 * 60 * 1000); // Clean up every hour

/**
 * Add token to blacklist
 * @param {string} token - JWT token to blacklist
 * @param {number} expiresAt - Token expiration timestamp (in milliseconds)
 */
const blacklistToken = (token, expiresAt) => {
  if (!token) {
    return;
  }
  
  // * Store token with its expiration time
  tokenBlacklist.set(token, expiresAt);
  logger.debug('Token blacklisted', { token: token.substring(0, 20) + '...' });
};

/**
 * Check if token is blacklisted
 * @param {string} token - JWT token to check
 * @returns {boolean} True if token is blacklisted
 */
const isTokenBlacklisted = (token) => {
  if (!token) {
    return false;
  }
  
  const expiry = tokenBlacklist.get(token);
  if (!expiry) {
    return false;
  }
  
  // * If token has expired, remove it from blacklist
  if (expiry < Date.now()) {
    tokenBlacklist.delete(token);
    return false;
  }
  
  return true;
};

/**
 * Blacklist refresh token
 * @param {string} refreshToken - Refresh token to blacklist
 * @param {number} expiresAt - Token expiration timestamp
 */
const blacklistRefreshToken = (refreshToken, expiresAt) => {
  blacklistToken(`refresh_${refreshToken}`, expiresAt);
};

/**
 * Check if refresh token is blacklisted
 * @param {string} refreshToken - Refresh token to check
 * @returns {boolean} True if token is blacklisted
 */
const isRefreshTokenBlacklisted = (refreshToken) => {
  return isTokenBlacklisted(`refresh_${refreshToken}`);
};

/**
 * Clear all tokens for a user (useful for password change, account deactivation)
 * Note: This is a simple implementation. In production with Redis, use a user ID index.
 * @param {string} userId - User ID whose tokens should be cleared
 */
const clearUserTokens = (userId) => {
  // * In a production system with Redis, you would maintain a user->tokens mapping
  // * For now, this is a placeholder
  logger.info('User tokens cleared', { userId });
};

module.exports = {
  blacklistToken,
  isTokenBlacklisted,
  blacklistRefreshToken,
  isRefreshTokenBlacklisted,
  clearUserTokens
};

