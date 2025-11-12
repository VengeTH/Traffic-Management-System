/**
 * Violation Routes
 * Handle violation lookup, creation, and management
 */

const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Violation, User } = require('../models');
const { auth, enforcerAuth } = require('../middleware/auth');
const { asyncHandler, ValidationError, NotFoundError, AuthorizationError } = require('../middleware/errorHandler');
const { sendViolationNotificationSMS } = require('../utils/sms');
const { sendViolationNotification } = require('../utils/email');
const logger = require('../utils/logger');

const router = express.Router();

// * Validation middleware
const validateViolationSearch = [
  query('ovrNumber')
    .optional()
    .isLength({ min: 10, max: 20 })
    .withMessage('OVR number must be between 10 and 20 characters'),
  
  query('plateNumber')
    .optional()
    .isLength({ min: 5, max: 15 })
    .withMessage('Plate number must be between 5 and 15 characters'),
  
  query('driverLicenseNumber')
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
  
  // * Custom validation to ensure at least one search parameter is provided
  (req, res, next) => {
    const { ovrNumber, plateNumber, driverLicenseNumber } = req.query;
    if (!ovrNumber && !plateNumber && !driverLicenseNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide OVR number, plate number, or driver license number',
        error: 'VALIDATION_ERROR'
      });
    }
    next();
  }
];

const validateViolationCreation = [
  body('plateNumber')
    .isLength({ min: 5, max: 15 })
    .withMessage('Plate number must be between 5 and 15 characters'),
  
  body('vehicleType')
    .isIn(['motorcycle', 'car', 'truck', 'bus', 'tricycle', 'other'])
    .withMessage('Invalid vehicle type'),
  
  body('driverName')
    .isLength({ min: 2, max: 100 })
    .withMessage('Driver name must be between 2 and 100 characters'),
  
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
  
  body('driverPhone')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('violationType')
    .isIn([
      'speeding',
      'reckless_driving',
      'illegal_parking',
      'no_license_plate',
      'expired_registration',
      'no_drivers_license',
      'driving_under_influence',
      'disregarding_traffic_signals',
      'illegal_overtaking',
      'overloading',
      'no_helmet',
      'no_seatbelt',
      'illegal_turn',
      'blocking_intersection',
      'other'
    ])
    .withMessage('Invalid violation type'),
  
  body('violationDescription')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Violation description must be between 10 and 1000 characters'),
  
  body('violationLocation')
    .isLength({ min: 5, max: 200 })
    .withMessage('Violation location must be between 5 and 200 characters'),
  
  body('violationDate')
    .isISO8601()
    .withMessage('Please provide a valid violation date'),
  
  body('violationTime')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid violation time (HH:MM)'),
  
  body('baseFine')
    .isFloat({ min: 0 })
    .withMessage('Base fine must be a positive number'),
  
  body('additionalPenalties')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Additional penalties must be a positive number'),
  
  body('demeritPoints')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Demerit points must be between 0 and 100')
];

const validateDisputeSubmission = [
  body('reason')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Dispute reason must be between 10 and 1000 characters')
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
 * @route   GET /api/violations/search
 * @desc    Search violations by OVR number, plate number, or driver license
 * @access  Public
 */
router.get('/search', validateViolationSearch, checkValidation, asyncHandler(async (req, res) => {
  const { ovrNumber, plateNumber, driverLicenseNumber } = req.query;
  
  let violations = [];
  
  if (ovrNumber) {
    // * Search by OVR number
    const violation = await Violation.findByOVR(ovrNumber);
    if (violation) {
      violations = [violation];
    }
  } else if (plateNumber) {
    // * Search by plate number
    violations = await Violation.findByPlateNumber(plateNumber);
  } else if (driverLicenseNumber) {
    // * Search by driver license number
    violations = await Violation.findByDriverLicense(driverLicenseNumber);
  } else {
    throw new ValidationError('Please provide OVR number, plate number, or driver license number');
  }
  
  if (violations.length === 0) {
    return res.json({
      success: true,
      message: 'No violations found',
      data: {
        violations: []
      }
    });
  }
  
  res.json({
    success: true,
    message: `${violations.length} violation(s) found`,
    data: {
      violations: violations.map(v => v.toJSON())
    }
  });
}));

/**
 * @route   GET /api/violations/enforcer
 * @desc    Get violations issued by the current enforcer
 * @access  Private (Enforcers)
 */
router.get('/enforcer', enforcerAuth, asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    search, 
    status, 
    violationType 
  } = req.query;
  
  const offset = (page - 1) * limit;
  
  let whereClause = {
    enforcerId: req.user.id
  };
  
  if (search) {
    whereClause[require('sequelize').Op.or] = [
      { ovrNumber: { [require('sequelize').Op.iLike]: `%${search}%` } },
      { citationNumber: { [require('sequelize').Op.iLike]: `%${search}%` } },
      { plateNumber: { [require('sequelize').Op.iLike]: `%${search}%` } },
      { driverName: { [require('sequelize').Op.iLike]: `%${search}%` } }
    ];
  }
  
  if (status) {
    whereClause.status = status;
  }
  
  if (violationType) {
    whereClause.violationType = violationType;
  }
  
  const { count, rows: violations } = await Violation.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: 'enforcer',
        attributes: ['id', 'firstName', 'lastName', 'enforcerBadgeNumber']
      }
    ],
    order: [['createdAt', 'DESC']],
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
 * @route   GET /api/violations/:id
 * @desc    Get violation by ID
 * @access  Public
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const violation = await Violation.findByPk(id, {
    include: [
      {
        model: User,
        as: 'enforcer',
        attributes: ['id', 'firstName', 'lastName', 'enforcerBadgeNumber']
      }
    ]
  });
  
  if (!violation) {
    throw new NotFoundError('Violation not found');
  }
  
  res.json({
    success: true,
    data: {
      violation: violation.toJSON()
    }
  });
}));

/**
 * @route   POST /api/violations
 * @desc    Create a new violation (enforcers only)
 * @access  Private (Enforcers)
 */
router.post('/', enforcerAuth, validateViolationCreation, checkValidation, asyncHandler(async (req, res) => {
  const {
    plateNumber,
    vehicleType,
    vehicleMake,
    vehicleModel,
    vehicleColor,
    vehicleYear,
    driverName,
    driverLicenseNumber,
    driverAddress,
    driverPhone,
    violationType,
    violationDescription,
    violationLocation,
    violationDate,
    violationTime,
    baseFine,
    additionalPenalties,
    demeritPoints,
    notes
  } = req.body;
  
  // * Create violation
  const violation = await Violation.create({
    plateNumber: plateNumber.toUpperCase(),
    vehicleType,
    vehicleMake,
    vehicleModel,
    vehicleColor,
    vehicleYear,
    driverName,
    driverLicenseNumber,
    driverAddress,
    driverPhone,
    violationType,
    violationDescription,
    violationLocation,
    violationDate,
    violationTime,
    baseFine,
    additionalPenalties: additionalPenalties || 0,
    demeritPoints: demeritPoints || 0,
    notes,
    enforcerId: req.user.id,
    enforcerName: req.user.getFullName(),
    enforcerBadgeNumber: req.user.enforcerBadgeNumber || 'N/A'
  });
  
  // * Send notification if phone number is provided
  if (driverPhone) {
    try {
      const paymentUrl = `${process.env.FRONTEND_URL}/pay-violation?ovr=${violation.ovrNumber}`;
      
      // * Send SMS notification
      await sendViolationNotificationSMS(violation, paymentUrl);
      
      // * Mark SMS as sent
      violation.smsSent = true;
      await violation.save();
      
    } catch (error) {
      logger.error('Failed to send violation notification SMS:', error);
    }
  }
  
  // * Send email notification if email is available
  // * Note: You might want to add email field to violation model
  try {
    const paymentUrl = `${process.env.FRONTEND_URL}/pay-violation?ovr=${violation.ovrNumber}`;
    await sendViolationNotification(violation, paymentUrl);
    
    // * Mark email as sent
    violation.emailSent = true;
    await violation.save();
    
  } catch (error) {
    logger.error('Failed to send violation notification email:', error);
  }
  
  // * Create in-app notification if user exists (by driver license or phone)
  try {
    const { createViolationNotification } = require('../utils/notifications');
    let user = null;
    
    // Try to find user by driver license number
    if (driverLicenseNumber) {
      user = await User.findOne({ where: { driverLicenseNumber } });
    }
    
    // If not found, try by phone number
    if (!user && driverPhone) {
      user = await User.findOne({ where: { phoneNumber: driverPhone } });
    }
    
    if (user) {
      await createViolationNotification(user.id, violation);
    }
  } catch (error) {
    logger.error('Failed to create violation notification:', error);
  }
  
  res.status(201).json({
    success: true,
    message: 'Violation created successfully',
    data: {
      violation: violation.toJSON()
    }
  });
}));

/**
 * @route   PUT /api/violations/:id
 * @desc    Update violation (enforcers only)
 * @access  Private (Enforcers)
 */
router.put('/:id', enforcerAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const violation = await Violation.findByPk(id);
  if (!violation) {
    throw new NotFoundError('Violation not found');
  }
  
  // * Check if enforcer can edit this violation
  if (violation.enforcerId !== req.user.id && req.user.role !== 'admin') {
    throw new AuthorizationError('You can only edit violations you created');
  }
  
  // * Update violation
  const updatedViolation = await violation.update(req.body);
  
  res.json({
    success: true,
    message: 'Violation updated successfully',
    data: {
      violation: updatedViolation.toJSON()
    }
  });
}));

/**
 * @route   POST /api/violations/:id/dispute
 * @desc    Submit dispute for violation
 * @access  Public
 */
router.post('/:id/dispute', validateDisputeSubmission, checkValidation, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  const violation = await Violation.findByPk(id);
  if (!violation) {
    throw new NotFoundError('Violation not found');
  }
  
  // * Check if violation can be disputed
  if (!violation.canBeDisputed()) {
    throw new ValidationError('This violation cannot be disputed');
  }
  
  // * Submit dispute
  await violation.submitDispute(reason);
  
  res.json({
    success: true,
    message: 'Dispute submitted successfully',
    data: {
      violation: violation.toJSON()
    }
  });
}));

/**
 * @route   GET /api/violations/:id/qr
 * @desc    Generate QR code for violation
 * @access  Public
 */
router.get('/:id/qr', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const violation = await Violation.findByPk(id);
  if (!violation) {
    throw new NotFoundError('Violation not found');
  }
  
  // * Generate QR code data
  const qrData = violation.generateQRData();
  
  res.json({
    success: true,
    data: {
      qrData,
      violation: {
        ovrNumber: violation.ovrNumber,
        citationNumber: violation.citationNumber,
        totalFine: violation.totalFine,
        dueDate: violation.dueDate
      }
    }
  });
}));

/**
 * @route   GET /api/violations/overdue
 * @desc    Get overdue violations (admin only)
 * @access  Private (Admin)
 */
router.get('/overdue', auth, asyncHandler(async (req, res) => {
  // * Check if user is admin
  if (!req.user.canPerformAdminAction()) {
    throw new AuthorizationError('Admin access required');
  }
  
  const overdueViolations = await Violation.getOverdueViolations();
  
  res.json({
    success: true,
    message: `${overdueViolations.length} overdue violation(s) found`,
    data: {
      violations: overdueViolations.map(v => v.toJSON())
    }
  });
}));

/**
 * @route   GET /api/violations/statistics
 * @desc    Get violation statistics (admin only)
 * @access  Private (Admin)
 */
router.get('/statistics', auth, asyncHandler(async (req, res) => {
  // * Check if user is admin
  if (!req.user.canPerformAdminAction()) {
    throw new AuthorizationError('Admin access required');
  }
  
  const { startDate, endDate } = req.query;
  
  let whereClause = {};
  if (startDate && endDate) {
    whereClause.violationDate = {
      [require('sequelize').Op.between]: [new Date(startDate), new Date(endDate)]
    };
  }
  
  // * Get violation statistics
  const totalViolations = await Violation.count({ where: whereClause });
  const pendingViolations = await Violation.count({ where: { ...whereClause, status: 'pending' } });
  const paidViolations = await Violation.count({ where: { ...whereClause, status: 'paid' } });
  const disputedViolations = await Violation.count({ where: { ...whereClause, status: 'disputed' } });
  
  // * Get violations by type
  const violationsByType = await Violation.findAll({
    where: whereClause,
    attributes: [
      'violationType',
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
    ],
    group: ['violationType'],
    order: [[require('sequelize').fn('COUNT', require('sequelize').col('id')), 'DESC']]
  });
  
  // * Get total fines collected
  const totalFines = await Violation.sum('totalFine', { where: { ...whereClause, status: 'paid' } });
  
  res.json({
    success: true,
    data: {
      totalViolations,
      pendingViolations,
      paidViolations,
      disputedViolations,
      totalFines: totalFines || 0,
      violationsByType: violationsByType.map(v => ({
        type: v.violationType,
        count: parseInt(v.dataValues.count)
      }))
    }
  });
}));

module.exports = router;


