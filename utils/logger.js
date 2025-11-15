/**
 * Logger Utility
 * Winston configuration for consistent logging
 */

const winston = require('winston');
const path = require('path');

// * Helper function to safely stringify objects with circular references
const safeStringify = (obj, space = 2) => {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    // * Skip circular references
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    // * Skip functions
    if (typeof value === 'function') {
      return '[Function]';
    }
    // * Skip undefined
    if (value === undefined) {
      return '[Undefined]';
    }
    return value;
  }, space);
};

// * Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    if (Object.keys(meta).length > 0) {
      try {
        log += `\n${safeStringify(meta, 2)}`;
      } catch (error) {
        // * Fallback if stringify still fails
        log += `\n[Error stringifying metadata: ${error.message}]`;
      }
    }
    
    return log;
  })
);

// * Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'las-pinas-traffic-system' },
  transports: [
    // * Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // * File transport for errors
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // * File transport for all logs
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ],
  
  // * Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/exceptions.log')
    })
  ],
  
  // * Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/rejections.log')
    })
  ]
});

// * Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

module.exports = logger;



