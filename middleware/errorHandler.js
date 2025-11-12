/**
 * Error Handler Middleware
 * Centralized error handling and logging
 */

const logger = require('../utils/logger');
const { sanitizeError, sanitizeObject, redactSensitive } = require('../utils/sanitize');

// * Error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // * Sanitize error before logging
  const sanitizedError = sanitizeError(err);
  const sanitizedRequest = sanitizeObject({
    requestId: req.id, // Include request ID for tracing
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    body: req.body,
    query: req.query,
    params: req.params
  });
  
  // * Log error with sanitized data
  logger.error('Error occurred:', {
    ...sanitizedError,
    request: sanitizedRequest
  });
  
  // * Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      message,
      statusCode: 400,
      error: 'VALIDATION_ERROR'
    };
  }
  
  // * Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      message,
      statusCode: 400,
      error: 'DUPLICATE_ENTRY'
    };
  }
  
  // * Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    error = {
      message: 'Referenced record does not exist.',
      statusCode: 400,
      error: 'FOREIGN_KEY_CONSTRAINT'
    };
  }
  
  // * JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token.',
      statusCode: 401,
      error: 'INVALID_TOKEN'
    };
  }
  
  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token has expired.',
      statusCode: 401,
      error: 'TOKEN_EXPIRED'
    };
  }
  
  // * Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      message: 'File size too large.',
      statusCode: 400,
      error: 'FILE_TOO_LARGE'
    };
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    error = {
      message: 'Too many files uploaded.',
      statusCode: 400,
      error: 'TOO_MANY_FILES'
    };
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = {
      message: 'Unexpected file field.',
      statusCode: 400,
      error: 'UNEXPECTED_FILE'
    };
  }
  
  // * Cast error (MongoDB/ObjectId)
  if (err.name === 'CastError') {
    error = {
      message: 'Invalid ID format.',
      statusCode: 400,
      error: 'INVALID_ID'
    };
  }
  
  // * Rate limit errors
  if (err.status === 429) {
    error = {
      message: 'Too many requests. Please try again later.',
      statusCode: 429,
      error: 'RATE_LIMIT_EXCEEDED'
    };
  }
  
  // * Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  const errorCode = error.error || 'INTERNAL_ERROR';
  
  // * Sanitize error message before sending to client
  const sanitizedMessage = redactSensitive(message);
  
  // * Don't send error details in production
  const response = {
    success: false,
    message: sanitizedMessage,
    error: errorCode,
    requestId: req.id, // Include request ID in error response
    ...(process.env.NODE_ENV === 'development' && {
      stack: sanitizedError?.stack,
      details: sanitizeObject(error)
    })
  };
  
  res.status(statusCode).json(response);
};

// * Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// * Custom error class
class AppError extends Error {
  constructor(message, statusCode, errorCode = 'CUSTOM_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.error = errorCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// * Validation error class
class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.field = field;
  }
}

// * Authentication error class
class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

// * Authorization error class
class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

// * Not found error class
class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

// * Conflict error class
class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

// * Rate limit error class
class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

module.exports = {
  errorHandler,
  asyncHandler,
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError
};



