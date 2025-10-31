/**
 * Admin Routes
 * Handle admin dashboard, user management, and system administration
 */

const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { User, Violation, Payment } = require('../models');
const { adminAuth } = require('../middleware/auth');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { sendViolationNotificationSMS, sendOverduePaymentSMS } = require('../utils/sms');
const { sendViolationNotification, sendOverduePaymentEmail } = require('../utils/email');
const logger = require('../utils/logger');

const router = express.Router();

// * Validation middleware
const validateUserUpdate = [
  body('firstName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phoneNumber')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('role')
    .optional()
    .isIn(['citizen', 'admin', 'enforcer'])
    .withMessage('Invalid role'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const validateDisputeProcessing = [
  body('approved')
    .isBoolean()
    .withMessage('Approved must be a boolean'),
  
  body('notes')
    .optional()
    .isLength({ min: 5, max: 500 })
    .withMessage('Notes must be between 5 and 500 characters')
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
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard statistics
 * @access  Private (Admin)
 */
router.get('/dashboard', adminAuth, asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  let whereClause = {};
  if (startDate && endDate) {
    whereClause.createdAt = {
      [require('sequelize').Op.between]: [new Date(startDate), new Date(endDate)]
    };
  }
  
  // * Get user statistics
  const totalUsers = await User.count({ where: whereClause });
  const activeUsers = await User.count({ where: { ...whereClause, isActive: true } });
  const verifiedUsers = await User.count({ where: { ...whereClause, isEmailVerified: true } });
  
  // * Get violation statistics
  const totalViolations = await Violation.count({ where: whereClause });
  const pendingViolations = await Violation.count({ where: { ...whereClause, status: 'pending' } });
  const paidViolations = await Violation.count({ where: { ...whereClause, status: 'paid' } });
  const overdueViolations = await Violation.count({
    where: {
      ...whereClause,
      status: 'pending',
      paymentDeadline: {
        [require('sequelize').Op.lt]: new Date()
      }
    }
  });
  
  // * Get payment statistics
  const totalPayments = await Payment.count({ where: whereClause });
  const completedPayments = await Payment.count({ where: { ...whereClause, status: 'completed' } });
  const totalRevenue = await Payment.sum('totalAmount', { where: { ...whereClause, status: 'completed' } });
  
  // * Get recent activities
  const recentViolations = await Violation.findAll({
    where: whereClause,
    order: [['createdAt', 'DESC']],
    limit: 10,
    include: [
      {
        model: User,
        as: 'enforcer',
        attributes: ['firstName', 'lastName']
      }
    ]
  });
  
  const recentPayments = await Payment.findAll({
    where: whereClause,
    order: [['createdAt', 'DESC']],
    limit: 10,
    include: [
      {
        model: Violation,
        as: 'violation',
        attributes: ['ovrNumber', 'violationType']
      }
    ]
  });
  
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
  
  // * Get payments by method
  const paymentsByMethod = await Payment.findAll({
    where: { ...whereClause, status: 'completed' },
    attributes: [
      'paymentMethod',
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      [require('sequelize').fn('SUM', require('sequelize').col('total_amount')), 'totalAmount']
    ],
    group: ['paymentMethod'],
    order: [[require('sequelize').fn('SUM', require('sequelize').col('total_amount')), 'DESC']]
  });
  
  res.json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        active: activeUsers,
        verified: verifiedUsers
      },
      violations: {
        total: totalViolations,
        pending: pendingViolations,
        paid: paidViolations,
        overdue: overdueViolations
      },
      payments: {
        total: totalPayments,
        completed: completedPayments,
        revenue: totalRevenue || 0
      },
      recentViolations: recentViolations.map(v => v.toJSON()),
      recentPayments: recentPayments.map(p => p.toJSON()),
      violationsByType: violationsByType.map(v => ({
        type: v.violationType,
        count: parseInt(v.dataValues.count)
      })),
      paymentsByMethod: paymentsByMethod.map(p => ({
        method: p.paymentMethod,
        count: parseInt(p.dataValues.count),
        totalAmount: parseFloat(p.dataValues.totalAmount || 0)
      }))
    }
  });
}));

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination
 * @access  Private (Admin)
 */
router.get('/users', adminAuth, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, role, status } = req.query;
  
  const offset = (page - 1) * limit;
  
  let whereClause = {};
  
  if (search) {
    whereClause[require('sequelize').Op.or] = [
      { firstName: { [require('sequelize').Op.iLike]: `%${search}%` } },
      { lastName: { [require('sequelize').Op.iLike]: `%${search}%` } },
      { email: { [require('sequelize').Op.iLike]: `%${search}%` } },
      { phoneNumber: { [require('sequelize').Op.iLike]: `%${search}%` } }
    ];
  }
  
  if (role) {
    whereClause.role = role;
  }
  
  if (status === 'active') {
    whereClause.isActive = true;
  } else if (status === 'inactive') {
    whereClause.isActive = false;
  }
  
  const { count, rows: users } = await User.findAndCountAll({
    where: whereClause,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
  
  res.json({
    success: true,
    data: {
      users: users.map(u => u.toJSON()),
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
 * @route   PUT /api/admin/users/:id
 * @desc    Update user (admin only)
 * @access  Private (Admin)
 */
router.put('/users/:id', adminAuth, validateUserUpdate, checkValidation, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const user = await User.findByPk(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  // * Update user
  const updatedUser = await user.update(req.body);
  
  res.json({
    success: true,
    message: 'User updated successfully',
    data: {
      user: updatedUser.toJSON()
    }
  });
}));

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Deactivate user (admin only)
 * @access  Private (Admin)
 */
router.delete('/users/:id', adminAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const user = await User.findByPk(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  // * Deactivate user instead of deleting
  await user.update({ isActive: false });
  
  res.json({
    success: true,
    message: 'User deactivated successfully'
  });
}));

/**
 * @route   GET /api/admin/violations
 * @desc    Get all violations with pagination and filters
 * @access  Private (Admin)
 */
router.get('/violations', adminAuth, asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    search, 
    status, 
    violationType, 
    startDate, 
    endDate 
  } = req.query;
  
  const offset = (page - 1) * limit;
  
  let whereClause = {};
  
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
  
  if (startDate && endDate) {
    whereClause.violationDate = {
      [require('sequelize').Op.between]: [new Date(startDate), new Date(endDate)]
    };
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
 * @route   POST /api/admin/violations/:id/process-dispute
 * @desc    Process violation dispute
 * @access  Private (Admin)
 */
router.post('/violations/:id/process-dispute', adminAuth, validateDisputeProcessing, checkValidation, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { approved, notes } = req.body;
  
  const violation = await Violation.findByPk(id);
  if (!violation) {
    throw new NotFoundError('Violation not found');
  }
  
  if (!violation.isDisputed) {
    throw new ValidationError('This violation is not disputed');
  }
  
  // * Process dispute
  await violation.processDispute(approved);
  
  // * Add admin notes if provided
  if (notes) {
    violation.notes = violation.notes ? `${violation.notes}\n\nAdmin Notes: ${notes}` : `Admin Notes: ${notes}`;
    await violation.save();
  }
  
  res.json({
    success: true,
    message: `Dispute ${approved ? 'approved' : 'rejected'} successfully`,
    data: {
      violation: violation.toJSON()
    }
  });
}));

/**
 * @route   POST /api/admin/notifications/send-reminders
 * @desc    Send payment reminders for overdue violations
 * @access  Private (Admin)
 */
router.post('/notifications/send-reminders', adminAuth, asyncHandler(async (req, res) => {
  const overdueViolations = await Violation.getOverdueViolations();
  
  let smsSent = 0;
  let emailSent = 0;
  let errors = [];
  
  for (const violation of overdueViolations) {
    try {
      const paymentUrl = `${process.env.FRONTEND_URL}/pay-violation?ovr=${violation.ovrNumber}`;
      
      // * Send SMS reminder
      if (violation.driverPhone && !violation.reminderSent) {
        await sendOverduePaymentSMS(violation, paymentUrl);
        violation.reminderSent = true;
        smsSent++;
      }
      
      // * Send email reminder (if email is available)
      // * Note: You might want to add email field to violation model
      try {
        await sendOverduePaymentEmail(violation, paymentUrl);
        emailSent++;
      } catch (error) {
        logger.error('Failed to send email reminder:', error);
      }
      
      await violation.save();
      
    } catch (error) {
      errors.push({
        violationId: violation.id,
        ovrNumber: violation.ovrNumber,
        error: error.message
      });
      logger.error('Failed to send reminder for violation:', error);
    }
  }
  
  res.json({
    success: true,
    message: `Reminders sent: ${smsSent} SMS, ${emailSent} emails`,
    data: {
      totalOverdue: overdueViolations.length,
      smsSent,
      emailSent,
      errors
    }
  });
}));

/**
 * @route   GET /api/admin/reports/violations
 * @desc    Generate violation report
 * @access  Private (Admin)
 */
router.get('/reports/violations', adminAuth, asyncHandler(async (req, res) => {
  const { startDate, endDate, format = 'json' } = req.query;
  
  if (!startDate || !endDate) {
    throw new ValidationError('Start date and end date are required');
  }
  
  const whereClause = {
    violationDate: {
      [require('sequelize').Op.between]: [new Date(startDate), new Date(endDate)]
    }
  };
  
  const violations = await Violation.findAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: 'enforcer',
        attributes: ['firstName', 'lastName']
      }
    ],
    order: [['violationDate', 'ASC']]
  });
  
  if (format === 'csv') {
    // * Generate CSV report
    const csv = [
      'OVR Number,Citation Number,Plate Number,Driver Name,Violation Type,Location,Date,Time,Status,Total Fine,Enforcer',
      ...violations.map(v => [
        v.ovrNumber,
        v.citationNumber,
        v.plateNumber,
        v.driverName,
        v.violationType,
        v.violationLocation,
        v.violationDate.toLocaleDateString('en-PH'),
        v.violationTime,
        v.status,
        v.totalFine,
        `${v.enforcer?.firstName || ''} ${v.enforcer?.lastName || ''}`
      ].join(','))
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="violations-${startDate}-to-${endDate}.csv"`);
    return res.send(csv);
  }
  
  res.json({
    success: true,
    data: {
      violations: violations.map(v => v.toJSON()),
      summary: {
        total: violations.length,
        pending: violations.filter(v => v.status === 'pending').length,
        paid: violations.filter(v => v.status === 'paid').length,
        disputed: violations.filter(v => v.status === 'disputed').length,
        totalFines: violations.reduce((sum, v) => sum + parseFloat(v.totalFine), 0)
      }
    }
  });
}));

/**
 * @route   GET /api/admin/reports/payments
 * @desc    Generate payment report
 * @access  Private (Admin)
 */
router.get('/reports/payments', adminAuth, asyncHandler(async (req, res) => {
  const { startDate, endDate, format = 'json' } = req.query;
  
  if (!startDate || !endDate) {
    throw new ValidationError('Start date and end date are required');
  }
  
  const whereClause = {
    initiatedAt: {
      [require('sequelize').Op.between]: [new Date(startDate), new Date(endDate)]
    }
  };
  
  const payments = await Payment.findAll({
    where: whereClause,
    include: [
      {
        model: Violation,
        as: 'violation',
        attributes: ['ovrNumber', 'violationType']
      }
    ],
    order: [['initiatedAt', 'ASC']]
  });
  
  if (format === 'csv') {
    // * Generate CSV report
    const csv = [
      'Payment ID,Receipt Number,OVR Number,Violation Type,Payer Name,Payer Email,Amount,Method,Status,Date',
      ...payments.map(p => [
        p.paymentId,
        p.receiptNumber,
        p.ovrNumber,
        p.violation?.violationType || '',
        p.payerName,
        p.payerEmail,
        p.totalAmount,
        p.paymentMethod,
        p.status,
        p.initiatedAt.toLocaleDateString('en-PH')
      ].join(','))
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="payments-${startDate}-to-${endDate}.csv"`);
    return res.send(csv);
  }
  
  res.json({
    success: true,
    data: {
      payments: payments.map(p => p.toJSON()),
      summary: {
        total: payments.length,
        completed: payments.filter(p => p.status === 'completed').length,
        failed: payments.filter(p => p.status === 'failed').length,
        totalRevenue: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + parseFloat(p.totalAmount), 0)
      }
    }
  });
}));

/**
 * @route   GET /api/admin/settings
 * @desc    Get system settings
 * @access  Private (Admin)
 */
router.get('/settings', adminAuth, asyncHandler(async (req, res) => {
  // * Get settings from environment variables
  // * In production, you might want to store these in a database
  const settings = {
    email: {
      smtpHost: process.env.SMTP_HOST || '',
      smtpPort: parseInt(process.env.SMTP_PORT || '587'),
      smtpUser: process.env.SMTP_USER || '',
      emailFrom: process.env.EMAIL_FROM || '',
    },
    sms: {
      provider: 'twilio',
      twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
      twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
    },
    payment: {
      paymongoSecretKey: process.env.PAYMONGO_SECRET_KEY ? '***' : '',
      paymongoPublicKey: process.env.PAYMONGO_PUBLIC_KEY ? '***' : '',
      gcashClientId: process.env.GCASH_CLIENT_ID ? '***' : '',
      mayaClientId: process.env.MAYA_CLIENT_ID ? '***' : '',
    },
    security: {
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
      jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
      rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
      rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    },
    app: {
      appName: process.env.APP_NAME || 'E-VioPay',
      appUrl: process.env.APP_URL || '',
      frontendUrl: process.env.FRONTEND_URL || '',
    },
  };

  res.json({
    success: true,
    data: settings
  });
}));

/**
 * @route   PUT /api/admin/settings
 * @desc    Update system settings
 * @access  Private (Admin)
 */
router.put('/settings', adminAuth, asyncHandler(async (req, res) => {
  // * Note: In production, you should save these to a database
  // * For now, we'll just validate and return success
  // * Actual updates would need environment variable management or database storage
  
  const { email, sms, payment, security, app } = req.body;

  // * Validate required fields
  if (email && (!email.smtpHost || !email.emailFrom)) {
    throw new ValidationError('Email configuration is incomplete');
  }

  if (sms && (!sms.twilioAccountSid || !sms.twilioPhoneNumber)) {
    throw new ValidationError('SMS configuration is incomplete');
  }

  // * In production, save to database here
  logger.info('System settings updated by admin', {
    adminId: req.user.id,
    changes: { email, sms, payment, security, app }
  });

  res.json({
    success: true,
    message: 'Settings updated successfully',
    data: {
      email: email || {},
      sms: sms || {},
      payment: payment || {},
      security: security || {},
      app: app || {},
    }
  });
}));

module.exports = router;


