/**
 * Las Piñas Traffic Online Payment System
 * Main Server File
 * 
 * Developed by The Heedful (https://vengeth.github.io/The-Heedful)
 * 
 * Table of Contents:
 * - Imports and Dependencies
 * - Environment Configuration
 * - Database Connection
 * - Security Middleware
 * - Rate Limiting
 * - Routes
 * - Error Handling
 * - Server Startup
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const morgan = require('morgan');
const path = require('path');

// * Import database connection
const { sequelize } = require('./config/database');

// * Import routes
const authRoutes = require('./routes/auth');
const violationRoutes = require('./routes/violations');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');

// * Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const { auth } = require('./middleware/auth');
const { csrfProtection, addCSRFToken } = require('./middleware/csrf');
const { enforceHTTPS } = require('./middleware/httpsEnforcement');
const { requestId } = require('./middleware/requestId');

// * Import utilities
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 5000;

// * HTTPS enforcement (must be before other middleware)
app.use(enforceHTTPS);

// * Request ID tracking (for security incident tracing)
app.use(requestId);

// * Security middleware
const isProduction = process.env.NODE_ENV === 'production';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: isProduction 
        ? ["'self'", "https://fonts.googleapis.com"]
        : ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.paymongo.com", "https://api.gcash.com"],
      formAction: ["'self'"]
    }
  },
  hsts: isProduction ? {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  } : false,
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },
  permissionsPolicy: {
    features: {
      geolocation: ["'self'"],
      camera: [],
      microphone: []
    }
  }
}));

// * CORS configuration
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000'];

// * Add GitHub Pages origin only if explicitly allowed
if (process.env.ALLOW_GITHUB_PAGES === 'true') {
  corsOrigins.push('https://vengeth.github.io');
}

app.use(cors({
  origin: (origin, callback) => {
    // * Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    if (corsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-CSRF-Token']
}));

// * Compression middleware
app.use(compression());

// * Request logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// * Rate limiting - more lenient in development
const isDevelopment = process.env.NODE_ENV === 'development';
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || (isDevelopment ? 1 * 60 * 1000 : 15 * 60 * 1000), // 1 minute in dev, 15 minutes in production
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || (isDevelopment ? 1000 : 100), // 1000 requests per minute in dev, 100 per 15 min in prod
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: isDevelopment ? 60 : Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000 / 60)
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for certain IPs in development (optional)
  skip: (req) => {
    if (isDevelopment && req.ip === '::1' || req.ip === '127.0.0.1' || req.ip?.includes('localhost')) {
      return false; // Still rate limit, but with higher limits
    }
    return false;
  }
});

// * Slow down requests - disabled in development
const speedLimiter = slowDown({
  windowMs: isDevelopment ? 1 * 60 * 1000 : 15 * 60 * 1000, // 1 minute in dev, 15 minutes in prod
  delayAfter: isDevelopment ? 500 : 50, // allow more requests in development
  delayMs: () => (isDevelopment ? 100 : 500), // shorter delay in development
});

app.use('/api/', limiter);
app.use('/api/', speedLimiter);

// * Stricter rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 20 : 5, // 5 attempts per 15 minutes in production
  message: {
    error: 'Too many authentication attempts. Please try again later.',
    retryAfter: 15
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful requests
});

// * Rate limiting for password reset endpoints
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDevelopment ? 10 : 3, // 3 attempts per hour in production
  message: {
    error: 'Too many password reset attempts. Please try again later.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false
});

// * Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// * Input sanitization middleware
const { sanitizeInput } = require('./middleware/sanitizeInput');
app.use('/api/', sanitizeInput);

// * CSRF protection for state-changing requests
app.use('/api/', csrfProtection);

// * Add CSRF token to responses for authenticated requests
app.use('/api/', addCSRFToken);

// * Static files - serve uploads with security headers
app.use('/uploads', (req, res, next) => {
  // * Prevent directory traversal
  const requestedPath = path.normalize(req.path);
  if (requestedPath.includes('..')) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
      error: 'INVALID_PATH'
    });
  }
  
  // * Set security headers for uploaded files
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Disposition', 'inline'); // Don't force download
  
  next();
}, express.static(path.join(__dirname, 'uploads'), {
  // * Don't serve directory listings
  index: false,
  // * Set cache control
  maxAge: '1d'
}));

// * Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// * API info endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Welcome to E-VioPay API',
    version: '1.0.0',
    status: 'Server is running',
    apiVersion: 'v1',
    endpoints: {
      health: '/health',
      api: '/api',
      v1: {
        auth: '/api/v1/auth',
        violations: '/api/v1/violations',
        payments: '/api/v1/payments',
        admin: '/api/v1/admin',
        users: '/api/v1/users'
      },
      // * Legacy endpoints (deprecated, use v1)
      legacy: {
        auth: '/api/auth',
        violations: '/api/violations',
        payments: '/api/payments',
        admin: '/api/admin',
        users: '/api/users'
      },
      note: 'Legacy endpoints are deprecated. Please migrate to /api/v1/* endpoints.'
    },
    timestamp: new Date().toISOString()
  });
});

// * API Routes (must come before static files)
// * API versioning: Current version is v1
// * Future versions should use /api/v2/, /api/v3/, etc.
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/violations', violationRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/admin', auth, adminRoutes);
app.use('/api/v1/users', auth, userRoutes);

// * Backward compatibility: Support non-versioned routes (deprecated)
// * TODO: Remove in future version after migration period
app.use('/api/auth', authRoutes);
app.use('/api/violations', violationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', auth, adminRoutes);
app.use('/api/users', auth, userRoutes);

// * Serve frontend build (available in both development and production)
app.use(express.static(path.join(__dirname, 'frontend/build')));

// * Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res, next) => {
  // Skip API routes and health check - let them fall through to notFound
  if (req.path.startsWith('/api/') || req.path.startsWith('/health')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// * Error handling middleware (must come last)
app.use(notFound);
app.use(errorHandler);

// * Validate critical environment variables
const validateEnvironment = () => {
  const requiredVars = {
    JWT_SECRET: {
      value: process.env.JWT_SECRET,
      minLength: 32,
      description: 'JWT secret key for token signing'
    },
    JWT_REFRESH_SECRET: {
      value: process.env.JWT_REFRESH_SECRET,
      minLength: 32,
      description: 'JWT refresh secret key for refresh token signing'
    }
  };
  
  // * Validate payment gateway secrets if payment features are enabled
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    // * In production, at least one payment gateway should be configured
    const hasPayMongo = process.env.PAYMONGO_SECRET_KEY && process.env.PAYMONGO_SECRET_KEY.startsWith('sk_');
    const hasGCash = process.env.GCASH_CLIENT_ID && process.env.GCASH_CLIENT_SECRET;
    const hasMaya = process.env.MAYA_CLIENT_ID && process.env.MAYA_CLIENT_SECRET;
    const hasDragonPay = process.env.DRAGONPAY_MERCHANT_ID && process.env.DRAGONPAY_PASSWORD;
    
    if (!hasPayMongo && !hasGCash && !hasMaya && !hasDragonPay) {
      logger.warn('⚠️  No payment gateway configured in production. Payment features will not work.');
    }
  }

  const missing = [];
  const invalid = [];

  for (const [varName, config] of Object.entries(requiredVars)) {
    if (!config.value) {
      missing.push(varName);
    } else if (config.value.length < config.minLength) {
      invalid.push({
        name: varName,
        currentLength: config.value.length,
        requiredLength: config.minLength,
        description: config.description
      });
    }
  }

  if (missing.length > 0) {
    logger.error('❌ Missing required environment variables:', missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (invalid.length > 0) {
    logger.error('❌ Invalid environment variables (too short):');
    invalid.forEach(({ name, currentLength, requiredLength, description }) => {
      logger.error(`  - ${name}: ${description} must be at least ${requiredLength} characters (current: ${currentLength})`);
    });
    throw new Error(`Invalid environment variables: ${invalid.map(v => v.name).join(', ')}`);
  }

  logger.info('✅ Environment variables validated successfully');
};

// * Database connection and server startup
const startServer = async () => {
  try {
    // * Validate environment variables first
    validateEnvironment();
    
    // * Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');
    
    // * Sync database models (in development) - disabled for now
    // if (process.env.NODE_ENV === 'development') {
    //   await sequelize.sync({ alter: true });
    //   logger.info('Database models synchronized.');
    // }
    
    // * Catch hidden process-level errors early during development
    process.on('uncaughtException', (err) => {
      // eslint-disable-next-line no-console
      console.error('Uncaught Exception:', err);
    });
    process.on('unhandledRejection', (err) => {
      // eslint-disable-next-line no-console
      console.error('Unhandled Rejection:', err);
    });

    // * Start server
    app.listen(PORT, () => {
      logger.info(`🚀 E-VioPay server running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
      logger.info(`📱 API Base URL: http://localhost:${PORT}/api`);
    });
    
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// * Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

// * Start the server
startServer();

module.exports = app;

