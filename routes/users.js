/**
 * User Routes
 * Handle user profile management and user-specific operations
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { User, Violation, Payment } = require('../models');
const { auth } = require('../middleware/auth');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// * Validation middleware
const validateProfileUpdate = [
  body('firstName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('lastName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('phoneNumber')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  
  body('address')
    .optional()
    .isLength({ min: 5, max: 500 })
    .withMessage('Address must be between 5 and 500 characters'),
  
  body('city')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  
  body('postalCode')
    .optional()
    .isLength({ min: 3, max: 10 })
    .withMessage('Postal code must be between 3 and 10 characters'),
  
  body('driverLicenseNumber')
    .optional()
    .isLength({ min: 5, max: 20 })
    .withMessage('Driver license number must be between 5 and 20 characters'),
  
  body('licenseExpiryDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid license expiry date')
];

const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
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
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', auth, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user.toJSON()
    }
  });
}));

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/profile', auth, validateProfileUpdate, checkValidation, asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    phoneNumber,
    dateOfBirth,
    address,
    city,
    postalCode,
    driverLicenseNumber,
    licenseExpiryDate
  } = req.body;
  
  // * Check if phone number is already taken by another user
  if (phoneNumber && phoneNumber !== req.user.phoneNumber) {
    const existingPhone = await User.findByPhoneNumber(phoneNumber);
    if (existingPhone && existingPhone.id !== req.user.id) {
      throw new ValidationError('Phone number is already registered by another user');
    }
  }
  
  // * Check if driver license is already taken by another user
  if (driverLicenseNumber && driverLicenseNumber !== req.user.driverLicenseNumber) {
    const existingLicense = await User.findByDriverLicense(driverLicenseNumber);
    if (existingLicense && existingLicense.id !== req.user.id) {
      throw new ValidationError('Driver license number is already registered by another user');
    }
  }
  
  // * Update user profile
  const updatedUser = await req.user.update({
    firstName: firstName || req.user.firstName,
    lastName: lastName || req.user.lastName,
    phoneNumber: phoneNumber || req.user.phoneNumber,
    dateOfBirth: dateOfBirth || req.user.dateOfBirth,
    address: address || req.user.address,
    city: city || req.user.city,
    postalCode: postalCode || req.user.postalCode,
    driverLicenseNumber: driverLicenseNumber || req.user.driverLicenseNumber,
    licenseExpiryDate: licenseExpiryDate || req.user.licenseExpiryDate
  });
  
  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: updatedUser.toJSON()
    }
  });
}));

/**
 * @route   PUT /api/users/password
 * @desc    Change user password
 * @access  Private
 */
router.put('/password', auth, validatePasswordChange, checkValidation, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  // * Verify current password
  const isCurrentPasswordValid = await req.user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new ValidationError('Current password is incorrect');
  }
  
  // * Update password
  req.user.password = newPassword;
  await req.user.save();
  
  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

/**
 * @route   GET /api/users/violations
 * @desc    Get user's violations (if they have driver license)
 * @access  Private
 */
router.get('/violations', auth, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  
  const offset = (page - 1) * limit;
  
  let whereClause = {};
  
  // * If user has driver license, search by it
  if (req.user.driverLicenseNumber) {
    whereClause.driverLicenseNumber = req.user.driverLicenseNumber;
  } else {
    // * If no driver license, search by phone number
    whereClause.driverPhone = req.user.phoneNumber;
  }
  
  if (status) {
    whereClause.status = status;
  }
  
  const { count, rows: violations } = await Violation.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: 'enforcer',
        attributes: ['firstName', 'lastName']
      }
    ],
    order: [['violationDate', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
  
  res.json({
    success: true,
    data: {
      violations: violations.map(v => v.toJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    }
  });
}));

/**
 * @route   GET /api/users/payments
 * @desc    Get user's payment history
 * @access  Private
 */
router.get('/payments', auth, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  
  const offset = (page - 1) * limit;
  
  let whereClause = { payerId: req.user.id };
  
  if (status) {
    whereClause.status = status;
  }
  
  const { count, rows: payments } = await Payment.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Violation,
        as: 'violation',
        attributes: ['id', 'ovrNumber', 'citationNumber', 'violationType', 'violationLocation']
      }
    ],
    order: [['initiatedAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
  
  res.json({
    success: true,
    data: {
      payments: payments.map(p => p.toJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    }
  });
}));

/**
 * @route   GET /api/users/statistics
 * @desc    Get user's violation and payment statistics
 * @access  Private
 */
router.get('/statistics', auth, asyncHandler(async (req, res) => {
  let violationWhereClause = {};
  
  // * If user has driver license, search by it
  if (req.user.driverLicenseNumber) {
    violationWhereClause.driverLicenseNumber = req.user.driverLicenseNumber;
  } else {
    // * If no driver license, search by phone number
    violationWhereClause.driverPhone = req.user.phoneNumber;
  }
  
  // * Get violation statistics
  const totalViolations = await Violation.count({ where: violationWhereClause });
  const pendingViolations = await Violation.count({ where: { ...violationWhereClause, status: 'pending' } });
  const paidViolations = await Violation.count({ where: { ...violationWhereClause, status: 'paid' } });
  const overdueViolations = await Violation.count({
    where: {
      ...violationWhereClause,
      status: 'pending',
      paymentDeadline: {
        [require('sequelize').Op.lt]: new Date()
      }
    }
  });
  
  // * Get payment statistics
  const totalPayments = await Payment.count({ where: { payerId: req.user.id } });
  const completedPayments = await Payment.count({ where: { payerId: req.user.id, status: 'completed' } });
  const totalAmountPaid = await Payment.sum('totalAmount', { where: { payerId: req.user.id, status: 'completed' } });
  
  // * Get recent violations
  const recentViolations = await Violation.findAll({
    where: violationWhereClause,
    order: [['violationDate', 'DESC']],
    limit: 5
  });
  
  // * Get recent payments
  const recentPayments = await Payment.findAll({
    where: { payerId: req.user.id },
    order: [['initiatedAt', 'DESC']],
    limit: 5,
    include: [
      {
        model: Violation,
        as: 'violation',
        attributes: ['ovrNumber', 'violationType']
      }
    ]
  });
  
  res.json({
    success: true,
    data: {
      violations: {
        total: totalViolations,
        pending: pendingViolations,
        paid: paidViolations,
        overdue: overdueViolations
      },
      payments: {
        total: totalPayments,
        completed: completedPayments,
        totalAmount: totalAmountPaid || 0
      },
      recentViolations: recentViolations.map(v => v.toJSON()),
      recentPayments: recentPayments.map(p => p.toJSON())
    }
  });
}));

/**
 * @route   POST /api/users/enable-2fa
 * @desc    Enable two-factor authentication
 * @access  Private
 */
router.post('/enable-2fa', auth, asyncHandler(async (req, res) => {
  if (req.user.twoFactorEnabled) {
    throw new ValidationError('Two-factor authentication is already enabled');
  }
  
  // * Generate 2FA secret
  const crypto = require('crypto');
  const secret = crypto.randomBytes(32).toString('base32');
  
  // * Update user with 2FA secret
  req.user.twoFactorSecret = secret;
  req.user.twoFactorEnabled = true;
  await req.user.save();
  
  res.json({
    success: true,
    message: 'Two-factor authentication enabled successfully',
    data: {
      secret,
      qrCodeUrl: `otpauth://totp/LasPinasTraffic:${req.user.email}?secret=${secret}&issuer=LasPinasTraffic`
    }
  });
}));

/**
 * @route   POST /api/users/disable-2fa
 * @desc    Disable two-factor authentication
 * @access  Private
 */
router.post('/disable-2fa', auth, asyncHandler(async (req, res) => {
  if (!req.user.twoFactorEnabled) {
    throw new ValidationError('Two-factor authentication is not enabled');
  }
  
  // * Disable 2FA
  req.user.twoFactorEnabled = false;
  req.user.twoFactorSecret = null;
  await req.user.save();
  
  res.json({
    success: true,
    message: 'Two-factor authentication disabled successfully'
  });
}));

/**
 * @route   DELETE /api/users/account
 * @desc    Deactivate user account
 * @access  Private
 */
router.delete('/account', auth, asyncHandler(async (req, res) => {
  // * Check if user has pending violations
  let violationWhereClause = {};
  
  if (req.user.driverLicenseNumber) {
    violationWhereClause.driverLicenseNumber = req.user.driverLicenseNumber;
  } else {
    violationWhereClause.driverPhone = req.user.phoneNumber;
  }
  
  const pendingViolations = await Violation.count({
    where: { ...violationWhereClause, status: 'pending' }
  });
  
  if (pendingViolations > 0) {
    throw new ValidationError('Cannot deactivate account with pending violations');
  }
  
  // * Deactivate account
  req.user.isActive = false;
  await req.user.save();
  
  res.json({
    success: true,
    message: 'Account deactivated successfully'
  });
}));

module.exports = router;



