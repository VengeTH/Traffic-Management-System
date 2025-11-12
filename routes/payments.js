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
  max: isDevelopment ? 10 : 3, // 3 payment attempts per 15 minutes in production
  message: {
    error: 'Too many payment attempts. Please try again later.',
    retryAfter: 15
  },
  standardHeaders: true,
  legacyHeaders: false
});

// * Payment gateway integrations
const paymentGateways = {
  // * PayMongo integration
  paymongo: {
    async createPayment(paymentData) {
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
  }
};

// * Validation middleware
const validatePaymentInitiation = [
  body('ovrNumber')
    .isLength({ min: 10, max: 20 })
    .withMessage('OVR number must be between 10 and 20 characters'),
  
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
];

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
 * @access  Public (with rate limiting)
 */
router.post('/initiate', paymentLimiter, validatePaymentInitiation, checkValidation, asyncHandler(async (req, res) => {
  // * Sanitize input
  const sanitizedBody = sanitizeObject(req.body, ['payerEmail', 'payerPhone', 'payerName']);
  const {
    ovrNumber,
    paymentMethod,
    payerName,
    payerEmail,
    payerPhone,
    payerId
  } = sanitizedBody;
  
  // * Find violation by OVR number
  const violation = await Violation.findByOVR(ovrNumber);
  if (!violation) {
    throw new NotFoundError('Violation not found');
  }
  
  // * Check if violation is already paid
  if (violation.status === 'paid') {
    throw new ValidationError('This violation has already been paid');
  }
  
  // * Validate payment amount matches violation amount (prevent tampering)
  const expectedAmount = parseFloat(violation.totalFine);
  if (req.body.amount && Math.abs(parseFloat(req.body.amount) - expectedAmount) > 0.01) {
    logger.warn('Payment amount mismatch', {
      expected: expectedAmount,
      provided: req.body.amount,
      ovrNumber,
      ip: req.ip
    });
    throw new ValidationError('Payment amount does not match violation amount');
  }
  
  // * Check if violation is overdue
  if (violation.isOverdue()) {
    // * Add late payment penalty (10% of total fine)
    const latePenalty = parseFloat(violation.totalFine) * 0.1;
    violation.additionalPenalties = parseFloat(violation.additionalPenalties || 0) + latePenalty;
    violation.totalFine = parseFloat(violation.totalFine) + latePenalty;
    await violation.save();
  }
  
  // * Sanitize payer name and email before storage
  const sanitizedName = redactSensitive(payerName).replace(/[<>]/g, '');
  const sanitizedEmail = payerEmail.toLowerCase().trim();
  
  // * Create payment record
  const payment = await Payment.create({
    violationId: violation.id,
    ovrNumber: violation.ovrNumber,
    citationNumber: violation.citationNumber,
    payerId: payerId || null,
    payerName: sanitizedName,
    payerEmail: sanitizedEmail,
    payerPhone: payerPhone ? redactSensitive(payerPhone) : null,
    amount: violation.totalFine,
    currency: 'PHP',
    paymentMethod,
    paymentProvider: paymentMethod === 'paymongo' ? 'PayMongo' : 
                    paymentMethod === 'gcash' ? 'GCash' :
                    paymentMethod === 'maya' ? 'Maya' :
                    paymentMethod === 'dragonpay' ? 'DragonPay' : 'Other',
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });
  
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
    
    res.json({
      success: true,
      message: 'Payment initiated successfully',
      data: {
        payment: payment.toJSON(),
        redirectUrl: gatewayResult.redirectUrl,
        gatewayTransactionId: gatewayResult.gatewayTransactionId
      }
    });
    
  } catch (error) {
    // * Mark payment as failed
    await payment.markAsFailed('GATEWAY_ERROR', error.message);
    
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
  const payment = await Payment.findByPaymentId(paymentId);
  if (!payment) {
    throw new NotFoundError('Payment not found');
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
      await payment.markAsFailed('PAYMENT_FAILED', 'Payment was not completed');
      
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
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const payment = await Payment.findByPk(id, {
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



