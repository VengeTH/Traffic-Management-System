/**
 * Payment Routes
 * Handle payment processing, gateway integration, and receipt generation
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { Violation, Payment, User } = require('../models');
const { auth, optionalAuth } = require('../middleware/auth');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { sanitizeObject, redactSensitive } = require('../utils/sanitize');
const { sendPaymentReceipt } = require('../utils/email');
const { sendPaymentConfirmationSMS } = require('../utils/sms');
const { generateQRCode } = require('../utils/qrcode');
const logger = require('../utils/logger');

const router = express.Router();

// * Stricter rate limiting for payment endpoints
const isDevelopment = process.env.NODE_ENV === 'development';
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 100 : 3, // Increased for development to allow testing
  message: {
    error: 'Too many payment attempts. Please try again later.',
    retryAfter: 15
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // * Skip rate limiting for localhost in development
    return isDevelopment && (req.ip === '::1' || req.ip === '127.0.0.1' || req.ip === '::ffff:127.0.0.1');
  }
});

// * Check if demo/sandbox mode is enabled
const isDemoMode = process.env.DEMO_MODE === 'true' || process.env.NODE_ENV === 'development';

// * Payment gateway integrations
const paymentGateways = {
  // * PayMongo integration
  paymongo: {
    async createPayment(paymentData) {
      // * In sandbox mode, simulate successful payment with realistic transaction IDs
      if (isDemoMode) {
        logger.info('Processing PayMongo payment', { paymentId: paymentData.paymentId });
        // * Generate realistic PayMongo transaction ID (format: src_xxxxxxxxxxxxx)
        const txId = `src_${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
        return {
          success: true,
          gatewayTransactionId: txId,
          gatewayReference: `PM${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          gatewayResponse: { status: 'paid' },
          redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?payment_id=${paymentData.paymentId}`
        };
      }
      
      const axios = require('axios');
      
      try {
        const response = await axios.post('https://api.paymongo.com/v1/sources', {
          data: {
            attributes: {
              amount: Math.round(paymentData.amount * 100), // Convert to centavos
              redirect: {
                success: `${process.env.FRONTEND_URL}/payment/success?payment_id=${paymentData.paymentId}`,
                failed: `${process.env.FRONTEND_URL}/payment/failed?payment_id=${paymentData.paymentId}`
              },
              type: 'gcash',
              currency: 'PHP'
            }
          }
        }, {
          headers: {
            'Authorization': `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY + ':').toString('base64')}`,
            'Content-Type': 'application/json'
          }
        });
        
        return {
          success: true,
          gatewayTransactionId: response.data.data.id,
          gatewayReference: response.data.data.attributes.reference_number,
          gatewayResponse: response.data,
          redirectUrl: response.data.data.attributes.redirect.checkout_url
        };
        
      } catch (error) {
        logger.error('PayMongo payment error:', error.response?.data || error.message);
        throw new Error('Payment gateway error: ' + (error.response?.data?.errors?.[0]?.detail || error.message));
      }
    },
    
    async verifyPayment(gatewayTransactionId) {
      const axios = require('axios');
      
      try {
        const response = await axios.get(`https://api.paymongo.com/v1/sources/${gatewayTransactionId}`, {
          headers: {
            'Authorization': `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY + ':').toString('base64')}`,
            'Content-Type': 'application/json'
          }
        });
        
        return {
          success: true,
          status: response.data.data.attributes.status,
          amount: response.data.data.attributes.amount / 100,
          gatewayResponse: response.data
        };
        
      } catch (error) {
        logger.error('PayMongo verification error:', error.response?.data || error.message);
        throw new Error('Payment verification failed');
      }
    }
  },
  
  // * GCash integration (simplified)
  gcash: {
    async createPayment(paymentData) {
      // * In sandbox mode, simulate successful payment with realistic transaction IDs
      if (isDemoMode) {
        logger.info('Processing GCash payment', { paymentId: paymentData.paymentId });
        // * Generate realistic GCash transaction ID
        const txId = `GCASH${Date.now()}${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
        return {
          success: true,
          gatewayTransactionId: txId,
          gatewayReference: `GC${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          gatewayResponse: { status: 'paid' },
          redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?payment_id=${paymentData.paymentId}`
        };
      }
      
      // * In a real implementation, you would integrate with GCash API
      // * For now, we'll simulate the payment process
      return {
        success: true,
        gatewayTransactionId: `GCASH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        gatewayReference: `GCASH_REF_${Date.now()}`,
        gatewayResponse: { status: 'pending' },
        redirectUrl: `${process.env.FRONTEND_URL}/payment/gcash?payment_id=${paymentData.paymentId}`
      };
    },
    
    async verifyPayment(gatewayTransactionId) {
      // * Simulate payment verification
      return {
        success: true,
        status: 'paid',
        amount: 0, // Will be set from payment data
        gatewayResponse: { status: 'paid' }
      };
    }
  },
  
  // * Maya integration (simplified)
  maya: {
    async createPayment(paymentData) {
      // * In sandbox mode, simulate successful payment with realistic transaction IDs
      if (isDemoMode) {
        logger.info('Processing Maya payment', { paymentId: paymentData.paymentId });
        // * Generate realistic Maya transaction ID
        const txId = `MAYA${Date.now()}${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
        return {
          success: true,
          gatewayTransactionId: txId,
          gatewayReference: `MY${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          gatewayResponse: { status: 'paid' },
          redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?payment_id=${paymentData.paymentId}`
        };
      }
      
      return {
        success: true,
        gatewayTransactionId: `MAYA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        gatewayReference: `MAYA_REF_${Date.now()}`,
        gatewayResponse: { status: 'pending' },
        redirectUrl: `${process.env.FRONTEND_URL}/payment/maya?payment_id=${paymentData.paymentId}`
      };
    },
    
    async verifyPayment(gatewayTransactionId) {
      return {
        success: true,
        status: 'paid',
        amount: 0,
        gatewayResponse: { status: 'paid' }
      };
    }
  },
  
  // * DragonPay integration (simplified)
  dragonpay: {
    async createPayment(paymentData) {
      // * In sandbox mode, simulate successful payment with realistic transaction IDs
      if (isDemoMode) {
        logger.info('Processing DragonPay payment', { paymentId: paymentData.paymentId });
        // * Generate realistic DragonPay transaction ID
        const txId = `DP${Date.now()}${Math.random().toString(36).substr(2, 10).toUpperCase()}`;
        return {
          success: true,
          gatewayTransactionId: txId,
          gatewayReference: `DPREF${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          gatewayResponse: { status: 'paid' },
          redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?payment_id=${paymentData.paymentId}`
        };
      }
      
      return {
        success: true,
        gatewayTransactionId: `DP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        gatewayReference: `DP_REF_${Date.now()}`,
        gatewayResponse: { status: 'pending' },
        redirectUrl: `${process.env.FRONTEND_URL}/payment/dragonpay?payment_id=${paymentData.paymentId}`
      };
    },
    
    async verifyPayment(gatewayTransactionId) {
      return {
        success: true,
        status: 'paid',
        amount: 0,
        gatewayResponse: { status: 'paid' }
      };
    }
  },
  
  // * Credit Card integration
  credit_card: {
    async createPayment(paymentData) {
      // * In sandbox mode, simulate successful payment with realistic transaction IDs
      if (isDemoMode) {
        logger.info('Processing Credit Card payment', { paymentId: paymentData.paymentId });
        // * Generate realistic credit card transaction ID
        const txId = `CC${Date.now()}${Math.random().toString(36).substr(2, 10).toUpperCase()}`;
        return {
          success: true,
          gatewayTransactionId: txId,
          gatewayReference: `CCREF${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          gatewayResponse: { status: 'paid' },
          redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?payment_id=${paymentData.paymentId}`
        };
      }
      
      // * In production, integrate with actual credit card gateway
      return {
        success: true,
        gatewayTransactionId: `CC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        gatewayReference: `CC_REF_${Date.now()}`,
        gatewayResponse: { status: 'pending' },
        redirectUrl: `${process.env.FRONTEND_URL}/payment/credit-card?payment_id=${paymentData.paymentId}`
      };
    },
    
    async verifyPayment(gatewayTransactionId) {
      return {
        success: true,
        status: 'paid',
        amount: 0,
        gatewayResponse: { status: 'paid' }
      };
    }
  },
  
  // * Debit Card integration
  debit_card: {
    async createPayment(paymentData) {
      // * In sandbox mode, simulate successful payment with realistic transaction IDs
      if (isDemoMode) {
        logger.info('Processing Debit Card payment', { paymentId: paymentData.paymentId });
        // * Generate realistic debit card transaction ID
        const txId = `DC${Date.now()}${Math.random().toString(36).substr(2, 10).toUpperCase()}`;
        return {
          success: true,
          gatewayTransactionId: txId,
          gatewayReference: `DCREF${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          gatewayResponse: { status: 'paid' },
          redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?payment_id=${paymentData.paymentId}`
        };
      }
      
      // * In production, integrate with actual debit card gateway
      return {
        success: true,
        gatewayTransactionId: `DC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        gatewayReference: `DC_REF_${Date.now()}`,
        gatewayResponse: { status: 'pending' },
        redirectUrl: `${process.env.FRONTEND_URL}/payment/debit-card?payment_id=${paymentData.paymentId}`
      };
    },
    
    async verifyPayment(gatewayTransactionId) {
      return {
        success: true,
        status: 'paid',
        amount: 0,
        gatewayResponse: { status: 'paid' }
      };
    }
  }
};

// * Validation middleware
const validatePaymentInitiation = [
  body('ovrNumber')
    .optional()
    .isLength({ min: 10, max: 20 })
    .withMessage('OVR number must be between 10 and 20 characters'),
  
  body('violationId')
    .optional()
    .isUUID()
    .withMessage('Violation ID must be a valid UUID'),
  
  body('paymentMethod')
    .isIn(['gcash', 'maya', 'paymongo', 'dragonpay', 'credit_card', 'debit_card'])
    .withMessage('Invalid payment method'),
  
  body('payerName')
    .isLength({ min: 2, max: 100 })
    .withMessage('Payer name must be between 2 and 100 characters'),
  
  body('payerEmail')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  
  body('payerPhone')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number')
].concat([
  body().custom((value) => {
    if (!value.ovrNumber && !value.violationId) {
      throw new Error('Either ovrNumber or violationId must be provided');
    }
    return true;
  })
]);

const validatePaymentConfirmation = [
  body('paymentId')
    .isLength({ min: 10, max: 50 })
    .withMessage('Payment ID must be between 10 and 50 characters'),
  
  body('gatewayTransactionId')
    .notEmpty()
    .withMessage('Gateway transaction ID is required')
];

// * Check validation results
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg).join(', ');
    throw new ValidationError(errorMessages);
  }
  next();
};

/**
 * @route   POST /api/payments/initiate
 * @desc    Initiate payment for violation
 * @access  Public (with rate limiting, optional auth for logged-in users)
 */
router.post('/initiate', optionalAuth, paymentLimiter, validatePaymentInitiation, checkValidation, asyncHandler(async (req, res) => {
  // * Sanitize input (but preserve violationId and ovrNumber - they should not be redacted)
  // * These fields are identifiers, not sensitive data, and redaction corrupts them
  const sanitizedBody = sanitizeObject(req.body, ['payerEmail', 'payerPhone', 'payerName']);
  
  // * Use original req.body for violationId and ovrNumber to prevent corruption from sanitization
  const {
    ovrNumber: sanitizedOvrNumber,
    violationId: sanitizedViolationId,
    paymentMethod,
    payerName,
    payerEmail,
    payerPhone,
    payerId
  } = sanitizedBody;
  
  // * Get violationId and ovrNumber from original body (before sanitization corrupts them)
  const violationId = req.body?.violationId || sanitizedViolationId;
  const ovrNumber = req.body?.ovrNumber || sanitizedOvrNumber;
  
  // * Find violation - try violationId first, then OVR number as fallback
  let violation = null;
  
  // * Log all received data for debugging
  logger.info('Payment initiation request received', {
    hasViolationId: !!violationId,
    hasOvrNumber: !!ovrNumber,
    violationIdLength: violationId ? violationId.length : 0,
    violationIdType: typeof violationId,
    ovrNumberValue: ovrNumber,
    ovrNumberType: typeof ovrNumber,
    ovrNumberLength: ovrNumber ? ovrNumber.length : 0,
    // * Show first and last few characters to help identify the value
    violationIdPreview: violationId ? `${violationId.substring(0, 8)}...${violationId.substring(violationId.length - 8)}` : null,
    ovrNumberPreview: ovrNumber ? `${ovrNumber.substring(0, 6)}...${ovrNumber.substring(ovrNumber.length - 4)}` : null,
    ip: req.ip
  });
  
  if (violationId) {
    // * Extract valid UUID FIRST before any normalization (handles corrupted input)
    const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    let normalizedViolationId = String(violationId || '').trim();
    
    // * Log the raw input for debugging
    logger.info('Raw violation ID received', {
      rawViolationId: violationId,
      rawLength: violationId ? String(violationId).length : 0,
      rawType: typeof violationId,
      ip: req.ip
    });
    
    // * Try to extract UUID from the raw string (before trimming)
    let extractedUUID = null;
    
    // * Strategy 1: Try direct match on raw string
    const rawMatch = String(violationId || '').match(uuidPattern);
    if (rawMatch && rawMatch[0] && rawMatch[0].length === 36) {
      extractedUUID = rawMatch[0];
      logger.info('Extracted UUID from raw violation ID (strategy 1)', {
        original: violationId,
        extracted: extractedUUID,
        originalLength: String(violationId).length,
        ip: req.ip
      });
    }
    
    // * Strategy 2: Try match on trimmed string
    if (!extractedUUID) {
      const trimmedMatch = normalizedViolationId.match(uuidPattern);
      if (trimmedMatch && trimmedMatch[0] && trimmedMatch[0].length === 36) {
        extractedUUID = trimmedMatch[0];
        logger.info('Extracted UUID from trimmed violation ID (strategy 2)', {
          original: violationId,
          extracted: extractedUUID,
          trimmedLength: normalizedViolationId.length,
          ip: req.ip
        });
      }
    }
    
    // * Strategy 3: Try extracting first 36 characters if it looks like a UUID
    if (!extractedUUID && normalizedViolationId.length >= 36) {
      const first36 = normalizedViolationId.substring(0, 36);
      if (uuidPattern.test(first36)) {
        extractedUUID = first36;
        logger.info('Extracted UUID from first 36 characters (strategy 3)', {
          original: violationId,
          extracted: extractedUUID,
          ip: req.ip
        });
      }
    }
    
    // * Strategy 4: Try finding UUID anywhere in the string (more aggressive)
    if (!extractedUUID) {
      const allMatches = String(violationId || '').match(new RegExp(uuidPattern.source, 'gi'));
      if (allMatches && allMatches.length > 0) {
        // * Use the first match that's exactly 36 characters
        for (const match of allMatches) {
          if (match && match.length === 36) {
            extractedUUID = match;
            logger.info('Extracted UUID from anywhere in string (strategy 4)', {
              original: violationId,
              extracted: extractedUUID,
              ip: req.ip
            });
            break;
          }
        }
      }
    }
    
    // * Use extracted UUID if found, otherwise use normalized version
    if (extractedUUID) {
      normalizedViolationId = extractedUUID;
    } else {
      // * If extraction failed, log warning but continue with normalized version
      logger.warn('Failed to extract UUID from violation ID, using normalized version', {
        original: violationId,
        normalized: normalizedViolationId,
        normalizedLength: normalizedViolationId.length,
        ip: req.ip
      });
    }
    
    // * Try to find by violation ID first (most reliable)
    logger.info('Searching for violation by ID', {
      providedViolationId: violationId,
      normalizedViolationId: normalizedViolationId,
      normalizedLength: normalizedViolationId.length,
      isValidUUID: uuidPattern.test(normalizedViolationId) && normalizedViolationId.length === 36,
      ip: req.ip
    });
    
    // * Only attempt lookup if we have a valid UUID format
    if (normalizedViolationId.length === 36 && uuidPattern.test(normalizedViolationId)) {
      violation = await Violation.findByPk(normalizedViolationId);
      
      // * Log the result of the primary lookup
      logger.info('Primary violation lookup by ID result', {
        searchedId: normalizedViolationId,
        found: !!violation,
        foundId: violation ? violation.id : null,
        foundOVR: violation ? violation.ovrNumber : null,
        foundDriverName: violation ? violation.driverName : null,
        hasOvrFallback: !!ovrNumber,
        ip: req.ip
      });
      
      // * Verify the found violation matches the expected OVR (if provided)
      // * Note: We trust the ID lookup result - if we found by ID, use it even if OVR doesn't match
      // * The OVR might be wrong in the request, but the ID is the primary key and should be trusted
      if (violation && ovrNumber) {
        const normalizedOVR = String(ovrNumber || '').trim().toUpperCase();
        const foundOVR = violation.ovrNumber ? String(violation.ovrNumber).trim().toUpperCase() : null;
        
        if (foundOVR !== normalizedOVR) {
          logger.warn('Found violation by ID but OVR does not match - using ID result (ID is primary key)', {
            foundId: violation.id,
            foundOVR: foundOVR,
            expectedOVR: normalizedOVR,
            note: 'Using violation found by ID since ID is the primary identifier',
            ip: req.ip
          });
          // * Don't clear violation - trust the ID lookup result
        } else {
          logger.info('Found violation by ID and OVR matches', {
            violationId: violation.id,
            ovrNumber: violation.ovrNumber,
            ip: req.ip
          });
        }
      } else if (violation) {
        logger.info('Found violation by ID (no OVR provided for verification)', {
          violationId: violation.id,
          ovrNumber: violation.ovrNumber,
          ip: req.ip
        });
      }
    } else {
      logger.warn('Invalid UUID format for violation ID, skipping primary lookup', {
        providedId: violationId,
        normalizedId: normalizedViolationId,
        length: normalizedViolationId.length,
        ip: req.ip
      });
    }
    
    if (!violation && ovrNumber) {
      // * Extract valid OVR from potentially corrupted input
      // * OVR formats: OVR###### (13 chars) or LPC-###### (10 chars)
      const ovrPattern = /(OVR|LPC-?)[0-9]{6,10}/i;
      let normalizedOVR = String(ovrNumber || '').trim().toUpperCase();
      
      // * Log raw OVR for debugging
      logger.info('Raw OVR received', {
        rawOVR: ovrNumber,
        rawLength: ovrNumber ? String(ovrNumber).length : 0,
        rawType: typeof ovrNumber,
        ip: req.ip
      });
      
      // * Try to extract OVR pattern from the string
      const ovrMatch = String(ovrNumber || '').match(ovrPattern);
      if (ovrMatch && ovrMatch[0]) {
        const extractedOVR = ovrMatch[0].toUpperCase();
        // * Normalize format: ensure LPC has dash, OVR doesn't
        if (extractedOVR.startsWith('LPC') && !extractedOVR.includes('-')) {
          normalizedOVR = extractedOVR.replace(/^(LPC)([0-9]+)$/i, 'LPC-$2');
        } else {
          normalizedOVR = extractedOVR;
        }
        logger.info('Extracted OVR from potentially corrupted input', {
          original: ovrNumber,
          extracted: normalizedOVR,
          originalLength: String(ovrNumber).length,
          extractedLength: normalizedOVR.length,
          ip: req.ip
        });
      } else {
        // * If pattern extraction failed, try to extract just the number part
        const numberPart = String(ovrNumber || '').replace(/[^0-9]/g, '');
        if (numberPart.length >= 6 && numberPart.length <= 10) {
          // * Try to reconstruct OVR - check if it starts with OVR or LPC
          const prefix = String(ovrNumber || '').toUpperCase().match(/(OVR|LPC)/i);
          if (prefix && prefix[0]) {
            if (prefix[0] === 'LPC') {
              normalizedOVR = `LPC-${numberPart}`;
            } else {
              normalizedOVR = `OVR${numberPart}`;
            }
            logger.info('Reconstructed OVR from number part', {
              original: ovrNumber,
              reconstructed: normalizedOVR,
              ip: req.ip
            });
          }
        }
      }
      
      logger.warn('Violation not found by ID, trying OVR number fallback', {
        violationId: violationId,
        normalizedViolationId: normalizedViolationId,
        providedOVR: ovrNumber,
        normalizedOVR: normalizedOVR,
        ovrLength: normalizedOVR.length,
        ip: req.ip
      });
      
      // * First, let's see what OVRs actually exist in the database
      const allViolations = await Violation.findAll({
        limit: 10,
        attributes: ['id', 'ovrNumber', 'driverLicenseNumber'],
        order: [['createdAt', 'DESC']]
      });
      
      logger.info('Database OVR samples for comparison', {
        searchedOVR: normalizedOVR,
        sampleOVRs: allViolations.map(v => ({
          id: v.id,
          ovr: v.ovrNumber,
          ovrLength: v.ovrNumber ? v.ovrNumber.length : 0,
          matches: v.ovrNumber && v.ovrNumber.toUpperCase() === normalizedOVR
        })),
        ip: req.ip
      });
      
      violation = await Violation.findByOVR(normalizedOVR);
      
      logger.info('OVR fallback lookup result', {
        found: !!violation,
        searchedOVR: normalizedOVR,
        foundId: violation ? violation.id : null,
        foundOVR: violation ? violation.ovrNumber : null,
        ip: req.ip
      });
    }
    
    // * If still not found after ID lookup and OVR fallback, try additional strategies
    if (!violation && ovrNumber) {
      const normalizedOVR = String(ovrNumber || '').trim().toUpperCase();
      
      // * Try finding by driver name + OVR pattern (more specific than OVR alone)
      if (payerName) {
        logger.warn('Trying to find violation by driver name + OVR pattern', {
          driverName: payerName,
          ovrPattern: normalizedOVR,
          ip: req.ip
        });
        
        const { Op } = require('sequelize');
        violation = await Violation.findOne({
          where: {
            driverName: {
              [Op.like]: `%${payerName.split(' ')[0]}%` // * Match first name
            },
            ovrNumber: {
              [Op.like]: `%${normalizedOVR.replace(/^OVR/, '')}%` // * Match OVR number part
            }
          },
          order: [['createdAt', 'DESC']]
        });
        
        if (violation) {
          logger.info('Found violation using driver name + OVR pattern', {
            violationId: violation.id,
            ovrNumber: violation.ovrNumber,
            driverName: violation.driverName,
            ip: req.ip
          });
        }
      }
      
      // * Final fallback: Only use if we have BOTH driver name AND OVR number to ensure we get the right violation
      // * This prevents matching the wrong violation when we have partial information
      if (!violation && payerName && ovrNumber) {
        const normalizedOVR = String(ovrNumber || '').trim().toUpperCase();
        const ovrNumberPart = normalizedOVR.replace(/^OVR/, '').replace(/[^0-9]/g, '');
        
        logger.warn('Final fallback: Matching by driver name + OVR number pattern', {
          driverName: payerName,
          ovrPattern: ovrNumberPart,
          ip: req.ip
        });
        
        const { Op } = require('sequelize');
        
        // * Try to match by driver name AND OVR number pattern
        let unpaidViolations = await Violation.findAll({
          where: {
            driverName: {
              [Op.like]: `%${payerName.split(' ')[0]}%`
            },
            ovrNumber: {
              [Op.like]: `%${ovrNumberPart}%`
            },
            status: {
              [Op.in]: ['pending', 'overdue']
            }
          },
          order: [['createdAt', 'DESC']],
          limit: 5
        });
        
        // * If we found matches, use the one that best matches the OVR
        if (unpaidViolations.length > 0) {
          // * Try to find exact OVR match first
          let matched = unpaidViolations.find(v => 
            v.ovrNumber && v.ovrNumber.toUpperCase().includes(ovrNumberPart)
          );
          
          // * If no exact match, use the first one
          if (!matched) {
            matched = unpaidViolations[0];
          }
          
          violation = matched;
          logger.info('Found violation using final fallback with OVR matching', {
            violationId: violation.id,
            ovrNumber: violation.ovrNumber,
            driverName: violation.driverName,
            strategy: 'final-driver-name-ovr-fallback',
            ip: req.ip
          });
        }
      }
      
      // * Absolute last resort: Only if we have NO OVR number, use driver name only
      // * This should rarely be needed
      if (!violation && payerName && !ovrNumber) {
        logger.warn('Absolute last resort: Using driver name only (no OVR available)', {
          driverName: payerName,
          ip: req.ip
        });
        
        const { Op } = require('sequelize');
        const unpaidViolations = await Violation.findAll({
          where: {
            driverName: {
              [Op.like]: `%${payerName.split(' ')[0]}%`
            },
            status: {
              [Op.in]: ['pending', 'overdue']
            }
          },
          order: [['createdAt', 'DESC']],
          limit: 1
        });
        
        if (unpaidViolations.length > 0) {
          violation = unpaidViolations[0];
          logger.info('Found violation using absolute last resort', {
            violationId: violation.id,
            ovrNumber: violation.ovrNumber,
            driverName: violation.driverName,
            strategy: 'absolute-last-resort',
            ip: req.ip
          });
        }
      }
      
      // * Final diagnostic if still not found
      if (!violation) {
        const allViolationsForDiagnostics = await Violation.findAll({
          limit: 20,
          attributes: ['id', 'ovrNumber', 'citationNumber', 'driverLicenseNumber', 'driverName', 'status'],
          order: [['createdAt', 'DESC']]
        });
        
        logger.error('Violation not found by ID or OVR - All fallback strategies exhausted', {
          providedViolationId: violationId,
          normalizedViolationId: normalizedViolationId,
          normalizedViolationIdLength: normalizedViolationId ? normalizedViolationId.length : 0,
          isValidUUID: violationId ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(normalizedViolationId) : false,
          ovrNumber: ovrNumber,
          normalizedOVR: ovrNumber ? String(ovrNumber || '').trim().toUpperCase() : null,
          payerName: payerName,
          totalViolationsInDB: allViolationsForDiagnostics.length,
          sampleViolations: allViolationsForDiagnostics.slice(0, 5).map(v => ({
            id: v.id,
            idLength: v.id ? v.id.length : 0,
            ovr: v.ovrNumber,
            driver: v.driverName,
            status: v.status
          })),
          ip: req.ip
        });
        
        throw new NotFoundError(`Violation not found with ID: ${normalizedViolationId}${ovrNumber ? ` or OVR: ${ovrNumber}` : ''}. Please verify the violation exists and try again.`);
      } else {
        logger.info('Violation found successfully', {
          violationId: violation.id,
          ovrNumber: violation.ovrNumber,
          driverName: violation.driverName,
          ip: req.ip
        });
      }
    }
  } else if (ovrNumber) {
    // * Find violation by OVR number (normalize input)
    const normalizedOVR = String(ovrNumber || '').trim().toUpperCase();
    
    // * Log the search attempt for debugging
    logger.info('Searching for violation by OVR', {
      providedOVR: ovrNumber,
      normalizedOVR: normalizedOVR,
      ip: req.ip
    });
    
    violation = await Violation.findByOVR(normalizedOVR);
    
    if (!violation) {
      // * Try to find any violations to see what format exists
      const sampleViolations = await Violation.findAll({ 
        limit: 3, 
        attributes: ['id', 'ovrNumber', 'citationNumber'],
        order: [['createdAt', 'DESC']]
      });
      
      logger.error('Violation lookup failed', {
        providedOVR: ovrNumber,
        normalizedOVR: normalizedOVR,
        sampleOVRs: sampleViolations.map(v => ({ id: v.id, ovr: v.ovrNumber })),
        ip: req.ip
      });
      throw new NotFoundError(`Violation not found with OVR number: ${normalizedOVR}. Try using violationId instead.`);
    }
  } else {
    throw new ValidationError('Either ovrNumber or violationId must be provided');
  }
  
  logger.info('Violation found', {
    violationId: violation.id,
    ovrNumber: violation.ovrNumber,
    status: violation.status
  });
  
  // * Always reload violation as a full Sequelize instance to ensure all instance methods are available
  // * This is necessary because some queries might return plain objects instead of full instances
  violation = await Violation.findByPk(violation.id);
  if (!violation) {
    throw new NotFoundError('Violation not found after reload');
  }
  
  // * Check if violation is already paid
  if (violation.status === 'paid') {
    throw new ValidationError('This violation has already been paid');
  }
  
  // * Get base fine (before any penalties) for penalty calculation
  const baseFine = parseFloat(violation.baseFine || violation.totalFine);
  const currentTotalFine = parseFloat(violation.totalFine);
  
  // * Check if violation is overdue
  // * Note: Using direct logic instead of instance method due to Sequelize version compatibility
  const isOverdue = violation.status === 'pending' && 
                    violation.paymentDeadline && 
                    new Date() > new Date(violation.paymentDeadline);
  
  // * Calculate final amount - use current totalFine as base
  // * Only add late penalty ONCE if violation is overdue
  // * Check if late penalty was already added by seeing if totalFine > baseFine
  let finalAmount = currentTotalFine;
  let penaltyAlreadyAdded = false; // * Initialize to false (only relevant if overdue)
  
  if (isOverdue) {
    // * Check if late penalty (10% of base) was already added
    // * If totalFine is significantly higher than baseFine, penalty was likely already added
    const latePenaltyAmount = baseFine * 0.1;
    const expectedWithPenalty = baseFine + latePenaltyAmount;
    penaltyAlreadyAdded = currentTotalFine >= expectedWithPenalty - 0.01; // * Allow small rounding differences
    
    if (!penaltyAlreadyAdded) {
      // * Add late payment penalty (10% of BASE fine, not current total)
      const latePenalty = baseFine * 0.1;
      violation.additionalPenalties = parseFloat(violation.additionalPenalties || 0) + latePenalty;
      violation.totalFine = currentTotalFine + latePenalty;
      finalAmount = violation.totalFine;
      await violation.save();
      
      logger.info('Late payment penalty applied', {
        baseFine: baseFine,
        currentTotalFine: currentTotalFine,
        penalty: latePenalty,
        finalAmount: finalAmount,
        ip: req.ip
      });
    } else {
      logger.info('Late payment penalty already applied, using current total', {
        baseFine: baseFine,
        currentTotalFine: currentTotalFine,
        expectedWithPenalty: expectedWithPenalty,
        finalAmount: finalAmount,
        ip: req.ip
      });
    }
  }
  
  // * Don't validate amount strictly - backend calculates the correct final amount
  // * Frontend might send original amount, but backend will use the correct final amount
  // * This prevents issues with penalties being added multiple times or frontend not knowing about penalties
  if (req.body.amount) {
    const providedAmount = parseFloat(req.body.amount);
    logger.info('Payment amount provided by frontend (will use backend-calculated amount)', {
      provided: providedAmount,
      finalAmount: finalAmount,
      isOverdue: isOverdue,
      penaltyAlreadyAdded: penaltyAlreadyAdded,
      ip: req.ip
    });
    // * No validation error - just log and use backend-calculated amount
  }
  
  // * Use final amount for payment (backend is source of truth)
  const paymentAmount = finalAmount;
  
  // * Get original values from req.body to avoid sanitization corruption
  // * Sanitization corrupts email and phone, so we need the original values
  const originalPayerEmail = req.body?.payerEmail || payerEmail;
  const originalPayerPhone = req.body?.payerPhone || payerPhone;
  const originalPayerName = req.body?.payerName || payerName;
  
  // * Sanitize payer name (but keep email and phone as-is for validation)
  const sanitizedName = originalPayerName.replace(/[<>]/g, '').trim();
  const sanitizedEmail = originalPayerEmail.toLowerCase().trim();
  const sanitizedPhone = originalPayerPhone ? originalPayerPhone.trim() : null;
  
  // * Generate payment ID before creation (required field)
  const generatedPaymentId = Payment.generatePaymentId();
  
  // * Calculate total amount (required field) - use paymentAmount which includes any penalties
  const totalAmount = paymentAmount; // * No processing fee for now
  
  // * Create payment record
  // * Use authenticated user's ID if available, otherwise use provided payerId or null
  // * This ensures payments from logged-in users are linked to their account
  const finalPayerId = req.user?.id || payerId || null;
  
  let payment = await Payment.create({
    paymentId: generatedPaymentId, // * Set explicitly to avoid validation error
    violationId: violation.id,
    ovrNumber: violation.ovrNumber,
    citationNumber: violation.citationNumber,
    payerId: finalPayerId,
    payerName: sanitizedName,
    payerEmail: sanitizedEmail, // * Use original email (not redacted)
    payerPhone: sanitizedPhone, // * Use original phone (not redacted)
    amount: paymentAmount, // * Use final calculated amount (includes penalties if overdue)
    totalAmount: totalAmount, // * Set explicitly to avoid validation error
    currency: 'PHP',
    paymentMethod,
    paymentProvider: paymentMethod === 'paymongo' ? 'PayMongo' : 
                    paymentMethod === 'gcash' ? 'GCash' :
                    paymentMethod === 'maya' ? 'Maya' :
                    paymentMethod === 'dragonpay' ? 'DragonPay' : 'Other',
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  // * Always reload payment as a full Sequelize instance to ensure all instance methods are available
  // * This is necessary because some queries might return plain objects instead of full instances
  payment = await Payment.findByPk(payment.id);
  if (!payment) {
    throw new NotFoundError('Payment not found after creation');
  }
  
  // * Log payment initiation for audit
  logger.info('Payment initiated', {
    paymentId: payment.paymentId,
    ovrNumber,
    amount: payment.amount,
    paymentMethod,
    ip: req.ip
  });
  
  // * Process payment through gateway
  const gateway = paymentGateways[paymentMethod];
  if (!gateway) {
    throw new ValidationError('Unsupported payment method');
  }
  
  try {
    // * Mark payment as processing
    await payment.markAsProcessing();
    
    // * Create payment with gateway
    const gatewayResult = await gateway.createPayment({
      paymentId: payment.paymentId,
      amount: payment.amount,
      currency: payment.currency,
      description: `Traffic Violation Payment - OVR: ${violation.ovrNumber}`,
      payerEmail: payment.payerEmail,
      payerName: payment.payerName
    });
    
    // * Update payment with gateway information
    await payment.update({
      gatewayTransactionId: gatewayResult.gatewayTransactionId,
      gatewayReference: gatewayResult.gatewayReference,
      gatewayResponse: gatewayResult.gatewayResponse
    });
    
    // * In sandbox mode, auto-complete the payment immediately
    // * Check if payment was processed successfully (status: 'paid' in response)
    if (isDemoMode && gatewayResult.gatewayResponse?.status === 'paid') {
      logger.info('Payment processed successfully', { paymentId: payment.paymentId });
      
      // * Mark payment as completed
      await payment.markAsCompleted();
      
      // * Update violation status
      violation.status = 'paid';
      violation.paymentMethod = paymentMethod;
      violation.paymentDate = new Date();
      violation.paymentReference = gatewayResult.gatewayReference;
      await violation.save();
      
      // * Generate receipt
      try {
        const qrCodeData = await generateQRCode({
          paymentId: payment.paymentId,
          amount: payment.amount,
          ovrNumber: violation.ovrNumber
        });
        
        await payment.update({
          qrCodeData: qrCodeData.data,
          qrCodeUrl: qrCodeData.url
        });
      } catch (qrError) {
        logger.warn('Failed to generate QR code', { error: qrError.message });
      }
    }
    
    res.json({
      success: true,
      message: isDemoMode ? 'Payment completed successfully' : 'Payment initiated successfully',
      data: {
        payment: payment.toJSON(),
        redirectUrl: gatewayResult.redirectUrl,
        gatewayTransactionId: gatewayResult.gatewayTransactionId
      }
    });
    
  } catch (error) {
    // * Mark payment as failed
    // * Use try-catch to handle cases where instance methods might not be available
    try {
      if (payment && typeof payment.markAsFailed === 'function') {
        await payment.markAsFailed('GATEWAY_ERROR', error.message);
      } else {
        // * Fallback: Direct update if instance method is not available
        await Payment.update(
          {
            status: 'failed',
            failedAt: new Date(),
            errorCode: 'GATEWAY_ERROR',
            errorMessage: error.message
          },
          {
            where: { id: payment.id }
          }
        );
        logger.warn('Payment marked as failed using direct update (instance method unavailable)', {
          paymentId: payment.paymentId,
          error: error.message
        });
      }
    } catch (markFailedError) {
      // * Log error but don't throw - the original error is more important
      logger.error('Failed to mark payment as failed', {
        paymentId: payment?.paymentId,
        error: markFailedError.message,
        originalError: error.message
      });
    }
    
    throw error;
  }
}));

/**
 * @route   POST /api/payments/confirm
 * @desc    Confirm payment completion
 * @access  Public (with rate limiting)
 */
router.post('/confirm', paymentLimiter, validatePaymentConfirmation, checkValidation, asyncHandler(async (req, res) => {
  // * Sanitize input
  const sanitizedBody = sanitizeObject(req.body);
  const { paymentId, gatewayTransactionId } = sanitizedBody;
  
  // * Find payment
  let payment = await Payment.findByPaymentId(paymentId);
  if (!payment) {
    throw new NotFoundError('Payment not found');
  }
  
  // * Always reload payment as a full Sequelize instance to ensure all instance methods are available
  // * This is necessary because some queries might return plain objects instead of full instances
  payment = await Payment.findByPk(payment.id);
  if (!payment) {
    throw new NotFoundError('Payment not found after reload');
  }
  
  // * Get violation
  const violation = await Violation.findByPk(payment.violationId);
  if (!violation) {
    throw new NotFoundError('Violation not found');
  }
  
  // * Verify payment with gateway
  const gateway = paymentGateways[payment.paymentMethod];
  if (!gateway) {
    throw new ValidationError('Unsupported payment method');
  }
  
  try {
    const verificationResult = await gateway.verifyPayment(gatewayTransactionId);
    
    if (verificationResult.status === 'paid') {
      // * Mark payment as completed
      await payment.markAsCompleted(
        gatewayTransactionId,
        payment.gatewayReference,
        verificationResult.gatewayResponse
      );
      
      // * Mark violation as paid
      await violation.markAsPaid(payment.paymentMethod, payment.paymentId);
      
      // * Generate QR code for receipt
      const qrCodeData = payment.generateQRCodeData();
      const qrCodeUrl = await generateQRCode(qrCodeData, payment.receiptNumber);
      
      // * Update payment with QR code
      await payment.update({
        qrCodeUrl
      });
      
      // * Send receipt notifications
      try {
        // * Send email receipt
        await sendPaymentReceipt(payment, violation);
        payment.receiptEmailSent = true;
        
        // * Send SMS confirmation
        if (payment.payerPhone) {
          await sendPaymentConfirmationSMS(payment, violation);
          payment.receiptSMSSent = true;
        }
        
        // * Create in-app notification if user has account
        if (payment.payerId) {
          const { createPaymentNotification } = require('../utils/notifications');
          try {
            await createPaymentNotification(payment.payerId, payment);
          } catch (error) {
            logger.error('Failed to create payment notification:', error);
          }
        }
        
        await payment.save();
        
      } catch (error) {
        logger.error('Failed to send payment notifications:', error);
      }
      
      res.json({
        success: true,
        message: 'Payment completed successfully',
        data: {
          payment: payment.toJSON(),
          violation: violation.toJSON(),
          receipt: {
            receiptNumber: payment.receiptNumber,
            qrCodeUrl: payment.qrCodeUrl,
            downloadUrl: `${process.env.APP_URL}/api/payments/${payment.id}/receipt`
          }
        }
      });
      
    } else {
      // * Mark payment as failed
      // * Use try-catch to handle cases where instance methods might not be available
      try {
        if (payment && typeof payment.markAsFailed === 'function') {
          await payment.markAsFailed('PAYMENT_FAILED', 'Payment was not completed');
        } else {
          // * Fallback: Direct update if instance method is not available
          await Payment.update(
            {
              status: 'failed',
              failedAt: new Date(),
              errorCode: 'PAYMENT_FAILED',
              errorMessage: 'Payment was not completed'
            },
            {
              where: { id: payment.id }
            }
          );
          logger.warn('Payment marked as failed using direct update (instance method unavailable)', {
            paymentId: payment.paymentId
          });
        }
      } catch (markFailedError) {
        // * Log error but don't throw - the validation error is more important
        logger.error('Failed to mark payment as failed', {
          paymentId: payment?.paymentId,
          error: markFailedError.message
        });
      }
      
      throw new ValidationError('Payment was not completed successfully');
    }
    
  } catch (error) {
    logger.error('Payment confirmation error:', error);
    throw error;
  }
}));

/**
 * @route   GET /api/payments/:id
 * @desc    Get payment details
 * @access  Public
 * @note    Accepts both UUID (id) and paymentId (string like PAY20241112345)
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // * Check if id is a UUID (36 characters with dashes) or a paymentId string
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  
  let payment = null;
  
  if (isUUID) {
    // * Try to find by UUID (primary key)
    payment = await Payment.findByPk(id, {
      include: [
        {
          model: Violation,
          as: 'violation',
          attributes: ['id', 'ovrNumber', 'citationNumber', 'violationType', 'violationLocation', 'violationDate']
        },
        {
          model: User,
          as: 'payer',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });
  } else {
    // * Try to find by paymentId (string like PAY20241112345)
    payment = await Payment.findByPaymentId(id);
    
    if (payment) {
      // * Reload with associations if found by paymentId
      payment = await Payment.findByPk(payment.id, {
        include: [
          {
            model: Violation,
            as: 'violation',
            attributes: ['id', 'ovrNumber', 'citationNumber', 'violationType', 'violationLocation', 'violationDate']
          },
          {
            model: User,
            as: 'payer',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });
    }
  }
  
  if (!payment) {
    throw new NotFoundError('Payment not found');
  }
  
  res.json({
    success: true,
    data: {
      payment: payment.toJSON()
    }
  });
}));

/**
 * @route   GET /api/payments/:id/receipt
 * @desc    Download payment receipt
 * @access  Public
 */
router.get('/:id/receipt', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const payment = await Payment.findByPk(id, {
    include: [
      {
        model: Violation,
        as: 'violation'
      }
    ]
  });
  
  if (!payment) {
    throw new NotFoundError('Payment not found');
  }
  
  if (payment.status !== 'completed') {
    throw new ValidationError('Payment is not completed');
  }
  
  // * Generate PDF receipt
  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument();
  
  // * Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="receipt-${payment.receiptNumber}.pdf"`);
  
  // * Pipe PDF to response
  doc.pipe(res);
  
  // * Add content to PDF
  doc.fontSize(20).text('Las Piñas Traffic Payment System', { align: 'center' });
  doc.moveDown();
  doc.fontSize(16).text('Payment Receipt', { align: 'center' });
  doc.moveDown(2);
  
  doc.fontSize(12).text(`Receipt Number: ${payment.receiptNumber}`);
  doc.text(`Payment Date: ${payment.completedAt.toLocaleDateString('en-PH')}`);
  doc.text(`Payment Method: ${payment.paymentMethod.toUpperCase()}`);
  doc.moveDown();
  
  doc.text(`OVR Number: ${payment.ovrNumber}`);
  doc.text(`Citation Number: ${payment.citationNumber}`);
  doc.moveDown();
  
  doc.text(`Payer Name: ${payment.payerName}`);
  doc.text(`Payer Email: ${payment.payerEmail}`);
  if (payment.payerPhone) {
    doc.text(`Payer Phone: ${payment.payerPhone}`);
  }
  doc.moveDown();
  
  doc.text(`Violation Type: ${payment.violation.violationType.replace('_', ' ').toUpperCase()}`);
  doc.text(`Violation Location: ${payment.violation.violationLocation}`);
  doc.text(`Violation Date: ${payment.violation.violationDate.toLocaleDateString('en-PH')}`);
  doc.moveDown();
  
  doc.fontSize(14).text(`Total Amount: ₱${payment.totalAmount.toFixed(2)}`, { align: 'right' });
  doc.moveDown(2);
  
  doc.fontSize(10).text('This receipt serves as proof of payment. Please keep it for your records.', { align: 'center' });
  doc.moveDown();
  doc.text('Thank you for your payment!', { align: 'center' });
  
  // * Finalize PDF
  doc.end();
}));

/**
 * @route   GET /api/payments/receipt/:receiptNumber
 * @desc    Get payment by receipt number
 * @access  Public
 */
router.get('/receipt/:receiptNumber', asyncHandler(async (req, res) => {
  const { receiptNumber } = req.params;
  
  const payment = await Payment.findByReceiptNumber(receiptNumber);
  if (!payment) {
    throw new NotFoundError('Receipt not found');
  }
  
  res.json({
    success: true,
    data: {
      payment: payment.toJSON()
    }
  });
}));

/**
 * @route   GET /api/payments/user/:userId
 * @desc    Get user's payment history
 * @access  Private
 */
router.get('/user/:userId', auth, asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  // * Check if user can access this data
  if (req.user.id !== userId && !req.user.canPerformAdminAction()) {
    throw new ValidationError('You can only view your own payment history');
  }
  
  const payments = await Payment.findAll({
    where: { payerId: userId },
    include: [
      {
        model: Violation,
        as: 'violation',
        attributes: ['id', 'ovrNumber', 'citationNumber', 'violationType', 'violationLocation']
      }
    ],
    order: [['initiatedAt', 'DESC']]
  });
  
  res.json({
    success: true,
    data: {
      payments: payments.map(p => p.toJSON())
    }
  });
}));

module.exports = router;



