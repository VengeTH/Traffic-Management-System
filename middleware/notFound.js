/**
 * Not Found Middleware
 * Handles 404 errors for undefined routes
 */

const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  error.error = 'NOT_FOUND';
  next(error);
};

module.exports = notFound;



