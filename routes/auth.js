/**
 * Authentication Routes
 * User registration, login, password reset, and email verification
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { generateToken, generateRefreshToken, verifyRefreshToken, auth } = require('../middleware/auth');
const { asyncHandler, ValidationError, AuthenticationError, NotFoundError } = require('../middleware/errorHandler');
const { sendEmail } = require('../utils/email');
const { sendSMS } = require('../utils/sms');
const logger = require('../utils/logger');

const router = express.Router();

// * Validation middleware
const validateRegistration = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phoneNumber')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('driverLicenseNumber')
    .optional()
    .isLength({ min: 5, max: 20 })
    .withMessage('Driver license number must be between 5 and 20 characters'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth')
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validatePasswordReset = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

const validatePasswordUpdate = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
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
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateRegistration, checkValidation, asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    password,
    driverLicenseNumber,
    dateOfBirth,
    address,
    city,
    postalCode
  } = req.body;
  
  // * Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw new ValidationError('User with this email already exists');
  }
  
  // * Check if phone number already exists
  const existingPhone = await User.findByPhoneNumber(phoneNumber);
  if (existingPhone) {
    throw new ValidationError('User with this phone number already exists');
  }
  
  // * Check if driver license already exists
  if (driverLicenseNumber) {
    const existingLicense = await User.findByDriverLicense(driverLicenseNumber);
    if (existingLicense) {
      throw new ValidationError('User with this driver license number already exists');
    }
  }
  
  // * Create user
  const user = await User.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    phoneNumber,
    password,
    driverLicenseNumber,
    dateOfBirth,
    address,
    city,
    postalCode
  });
  
  // * Generate verification token
  const verificationToken = user.generateEmailVerificationToken();
  await user.save();
  
  // * Send verification email
  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email - Las Piñas Traffic Payment System',
      template: 'emailVerification',
      data: {
        name: user.getFullName(),
        verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
      }
    });
  } catch (error) {
    logger.error('Failed to send verification email:', error);
  }
  
  // * Generate tokens
  const token = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please check your email for verification.',
    data: {
      user: user.toJSON(),
      token,
      refreshToken
    }
  });
}));

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validateLogin, checkValidation, asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // * Find user by email
  const user = await User.findByEmail(email);
  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }
  
  // * Check if account is locked
  if (user.isLocked()) {
    throw new AuthenticationError('Account is temporarily locked due to multiple failed login attempts');
  }
  
  // * Check if account is active
  if (!user.isActive) {
    throw new AuthenticationError('Account is deactivated. Please contact administrator');
  }
  
  // * Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    await user.incrementLoginAttempts();
    throw new AuthenticationError('Invalid email or password');
  }
  
  // * Reset login attempts on successful login
  await user.resetLoginAttempts();
  
  // * Generate tokens
  const token = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.toJSON(),
      token,
      refreshToken
    }
  });
}));

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    throw new AuthenticationError('Refresh token is required');
  }
  
  // * Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);
  
  // * Find user
  const user = await User.findByPk(decoded.userId);
  if (!user || !user.isActive) {
    throw new AuthenticationError('Invalid refresh token');
  }
  
  // * Generate new tokens
  const newToken = generateToken(user.id);
  const newRefreshToken = generateRefreshToken(user.id);
  
  res.json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      token: newToken,
      refreshToken: newRefreshToken
    }
  });
}));

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/forgot-password', validatePasswordReset, checkValidation, asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  // * Find user by email
  const user = await User.findByEmail(email);
  if (!user) {
    // * Don't reveal if user exists or not for security
    return res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  }
  
  // * Generate password reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save();
  
  // * Send password reset email
  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset - Las Piñas Traffic Payment System',
      template: 'passwordReset',
      data: {
        name: user.getFullName(),
        resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
      }
    });
  } catch (error) {
    logger.error('Failed to send password reset email:', error);
  }
  
  res.json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.'
  });
}));

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', validatePasswordUpdate, checkValidation, asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  
  // * Find user by reset token
  const user = await User.findOne({
    where: {
      passwordResetToken: token,
      passwordResetExpires: { [require('sequelize').Op.gt]: new Date() }
    }
  });
  
  if (!user) {
    throw new ValidationError('Invalid or expired reset token');
  }
  
  // * Update password
  user.password = password;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();
  
  res.json({
    success: true,
    message: 'Password has been reset successfully'
  });
}));

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email with token
 * @access  Public
 */
router.post('/verify-email', asyncHandler(async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    throw new ValidationError('Verification token is required');
  }
  
  // * Find user by verification token
  const user = await User.findOne({
    where: {
      emailVerificationToken: token,
      emailVerificationExpires: { [require('sequelize').Op.gt]: new Date() }
    }
  });
  
  if (!user) {
    throw new ValidationError('Invalid or expired verification token');
  }
  
  // * Mark email as verified
  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  await user.save();
  
  res.json({
    success: true,
    message: 'Email verified successfully'
  });
}));

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification
 * @access  Public
 */
router.post('/resend-verification', validatePasswordReset, checkValidation, asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  // * Find user by email
  const user = await User.findByEmail(email);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  if (user.isEmailVerified) {
    throw new ValidationError('Email is already verified');
  }
  
  // * Generate new verification token
  const verificationToken = user.generateEmailVerificationToken();
  await user.save();
  
  // * Send verification email
  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email - Las Piñas Traffic Payment System',
      template: 'emailVerification',
      data: {
        name: user.getFullName(),
        verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
      }
    });
  } catch (error) {
    logger.error('Failed to send verification email:', error);
  }
  
  res.json({
    success: true,
    message: 'Verification email sent successfully'
  });
}));

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', auth, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user.toJSON()
    }
  });
}));

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
router.post('/logout', auth, asyncHandler(async (req, res) => {
  // * In a more complex system, you might want to blacklist the token
  // * For now, we'll just return success and let the client remove the token
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

module.exports = router;



