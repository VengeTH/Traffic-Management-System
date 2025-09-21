/**
 * Las Piñas Traffic Online Payment System
 * Main Server File
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

// * Import utilities
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 5000;

// * Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.paymongo.com", "https://api.gcash.com"]
    }
  }
}));

// * CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// * Compression middleware
app.use(compression());

// * Request logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// * Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS) / 1000 / 60)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// * Slow down requests
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes, then...
  delayMs: 500 // begin adding 500ms of delay per request above 50
});

app.use('/api/', limiter);
app.use('/api/', speedLimiter);

// * Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// * Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
    message: 'Welcome to Las Piñas Traffic Online Payment System API',
    version: '1.0.0',
    status: 'Server is running',
    endpoints: {
      health: '/health',
      api: '/api',
      documentation: {
        auth: '/api/auth',
        violations: '/api/violations',
        payments: '/api/payments',
        admin: '/api/admin',
        users: '/api/users'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// * API Routes
app.use('/api/auth', authRoutes);
app.use('/api/violations', violationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', auth, adminRoutes);
app.use('/api/users', auth, userRoutes);

// * Serve frontend build (available in both development and production)
app.use(express.static(path.join(__dirname, 'frontend/build')));

// * Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res, next) => {
  // Skip API routes and let them be handled by the notFound middleware
  if (req.path.startsWith('/api/') || req.path.startsWith('/health')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// * Error handling middleware
app.use(notFound);
app.use(errorHandler);

// * Database connection and server startup
const startServer = async () => {
  try {
    // * Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');
    
    // * Sync database models (in development) - disabled for now
    // if (process.env.NODE_ENV === 'development') {
    //   await sequelize.sync({ alter: true });
    //   logger.info('Database models synchronized.');
    // }
    
    // * Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Las Piñas Traffic Payment System server running on port ${PORT}`);
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

