/**
 * User Routes
 * Handle user profile management and user-specific operations
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { User, Violation, Payment, Notification } = require('../models');
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
    .optional({ checkFalsy: true })
    .custom((value) => {
      // * If value is provided (not empty), validate length
      if (value && value.trim().length > 0) {
        if (value.trim().length < 5 || value.trim().length > 20) {
          throw new Error('Driver license number must be between 5 and 20 characters');
        }
      }
      return true;
    }),
  
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
  
  // * Normalize phone numbers for matching (remove spaces, dashes, ensure consistent format)
  const normalizePhone = (phone) => {
    if (!phone) return null;
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    // Ensure it starts with + if it has country code, otherwise return as is
    return cleaned.startsWith('+') ? cleaned : cleaned;
  };
  
  const userPhoneNormalized = normalizePhone(req.user.phoneNumber);
  
  // * Build where clause with OR conditions for better matching
  const { Op } = require('sequelize');
  
  // * Build the matching conditions (driver license or phone number)
  const matchingConditions = [];
  
  // * Try to match by driver license first (exact match)
  if (req.user.driverLicenseNumber) {
    matchingConditions.push({ driverLicenseNumber: req.user.driverLicenseNumber });
  }
  
  // * Also try to match by phone number (normalized) - multiple formats for better matching
  if (userPhoneNormalized) {
    matchingConditions.push(
      { driverPhone: req.user.phoneNumber }, // Original format
      { driverPhone: userPhoneNormalized }, // Normalized format
      { driverPhone: { [Op.like]: `%${userPhoneNormalized.replace('+', '')}%` } } // Partial match without +
    );
  }
  
  // * If no matching conditions, return empty
  if (matchingConditions.length === 0) {
    return res.json({
      success: true,
      data: {
        violations: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0
        }
      }
    });
  }
  
  // * Build the final where clause
  // * Combine matching conditions with OR, and status filter with AND
  const finalConditions = [
    { [Op.or]: matchingConditions }
  ];
  
  // * Add status filter if provided
  if (status) {
    finalConditions.push({ status });
  }
  
  // * If only one condition, use it directly; otherwise combine with AND
  const whereClause = finalConditions.length === 1 
    ? finalConditions[0]
    : { [Op.and]: finalConditions };
  
  // * Log for debugging
  logger.info('Fetching user violations', {
    userId: req.user.id,
    userPhone: req.user.phoneNumber,
    userPhoneNormalized: userPhoneNormalized,
    driverLicense: req.user.driverLicenseNumber || 'none',
    statusFilter: status || 'none',
    matchingConditionsCount: matchingConditions.length,
    whereClause: JSON.stringify(whereClause, null, 2)
  });
  
  const { count, rows: violations } = await Violation.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: 'enforcer',
        attributes: ['firstName', 'lastName'],
        required: false
      }
    ],
    order: [['violationDate', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
  
  logger.info('User violations query result', {
    userId: req.user.id,
    count: count,
    violationsFound: violations.length
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

/**
 * @route   GET /api/users/notifications
 * @desc    Get user notifications
 * @access  Private
 */
router.get('/notifications', auth, asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 50, unreadOnly = false } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = { userId: req.user.id };
    
    if (unreadOnly === 'true') {
      whereClause.isRead = false;
    }
    
    const notifications = await Notification.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    const unreadCount = await Notification.getUnreadCount(req.user.id);
    const total = await Notification.count({ where: { userId: req.user.id } });
    
    // * Map notifications to match frontend expected format (createdAt -> timestamp)
    const mappedNotifications = notifications.map(n => {
      const notification = n.toJSON();
      return {
        ...notification,
        timestamp: notification.createdAt || notification.created_at
      };
    });
    
    res.json({
      success: true,
      data: {
        notifications: mappedNotifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        unreadCount
      }
    });
  } catch (error) {
    // * Check if error is related to missing table or database issues
    if (error.name === 'SequelizeDatabaseError' || 
        error.message?.includes('does not exist') ||
        error.message?.includes('no such table')) {
      logger.warn('Notifications table may not exist. Run migrations to create it.');
      // * Return empty array if table doesn't exist (graceful degradation)
      return res.json({
        success: true,
        data: {
          notifications: [],
          pagination: {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 50,
            total: 0,
            pages: 0
          },
          unreadCount: 0
        }
      });
    }
    // * Re-throw other errors to be handled by asyncHandler
    throw error;
  }
}));

/**
 * @route   GET /api/users/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/notifications/unread-count', auth, asyncHandler(async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user.id);
    
    res.json({
      success: true,
      data: { count: count || 0 }
    });
  } catch (error) {
    // * Check if error is related to missing table or database issues
    if (error.name === 'SequelizeDatabaseError' || 
        error.message?.includes('does not exist') ||
        error.message?.includes('no such table')) {
      logger.warn('Notifications table may not exist. Run migrations to create it.');
      // * Return 0 if table doesn't exist (graceful degradation)
      return res.json({
        success: true,
        data: { count: 0 }
      });
    }
    // * Re-throw other errors to be handled by asyncHandler
    throw error;
  }
}));

/**
 * @route   PUT /api/users/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/notifications/:id/read', auth, asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    where: {
      id: req.params.id,
      userId: req.user.id
    }
  });
  
  if (!notification) {
    throw new NotFoundError('Notification not found');
  }
  
  await notification.markAsRead();
  
  res.json({
    success: true,
    message: 'Notification marked as read'
  });
}));

/**
 * @route   PUT /api/users/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/notifications/read-all', auth, asyncHandler(async (req, res) => {
  await Notification.update(
    { isRead: true, readAt: new Date() },
    {
      where: {
        userId: req.user.id,
        isRead: false
      }
    }
  );
  
  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
}));

module.exports = router;



