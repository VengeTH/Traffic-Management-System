/**
 * Authentication Routes
 * User registration, login, password reset, and email verification
 */

const express = require("express")
const { body, validationResult } = require("express-validator")
const rateLimit = require("express-rate-limit")
const { User } = require("../models")
const {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  auth,
} = require("../middleware/auth")
const {
  asyncHandler,
  ValidationError,
  AuthenticationError,
  NotFoundError,
} = require("../middleware/errorHandler")
const {
  blacklistToken,
  blacklistRefreshToken,
} = require("../middleware/tokenBlacklist")
const { sendEmail } = require("../utils/email")
const { sendSMS } = require("../utils/sms")
const { generateCSRFToken } = require("../middleware/csrf")
const jwt = require("jsonwebtoken")
const logger = require("../utils/logger")

const router = express.Router()

const attachCsrfToken = (res, userId, contextLabel) => {
  if (!res || !userId) {
    return
  }

  try {
    const token = generateCSRFToken(userId)
    res.setHeader("X-CSRF-Token", token)
  } catch (error) {
    logger.error(`Failed to issue CSRF token after ${contextLabel}:`, error)
  }
}

// * Rate limiting for authentication endpoints
const isDevelopment = process.env.NODE_ENV === "development"
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 20 : 5, // 5 attempts per 15 minutes in production
  message: {
    error: "Too many authentication attempts. Please try again later.",
    retryAfter: 15,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
})

// * Rate limiting for password reset endpoints
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDevelopment ? 10 : 3, // 3 attempts per hour in production
  message: {
    error: "Too many password reset attempts. Please try again later.",
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// * Validation middleware
const validateRegistration = [
  body("firstName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name can only contain letters and spaces"),

  body("lastName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Last name can only contain letters and spaces"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address"),

  body("phoneNumber")
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage("Please provide a valid phone number"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),

  body("driverLicenseNumber")
    .optional({ checkFalsy: true })
    .custom((value) => {
      // * If value is provided (not empty), validate length
      if (value && value.trim().length > 0) {
        if (value.trim().length < 5 || value.trim().length > 20) {
          throw new Error(
            "Driver license number must be between 5 and 20 characters"
          )
        }
      }
      return true
    }),

  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Please provide a valid date of birth"),
]

const validateLogin = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address"),

  body("password").notEmpty().withMessage("Password is required"),
]

const validatePasswordReset = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address"),
]

const validatePasswordUpdate = [
  body("token").notEmpty().withMessage("Reset token is required"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
]

// * Check validation results
const checkValidation = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((err) => err.msg)
      .join(", ")
    logger.warn("Validation failed", {
      path: req.path,
      method: req.method,
      bodyKeys: Object.keys(req.body),
      emailValue: req.body.email,
      emailType: typeof req.body.email,
      emailLength: req.body.email?.length,
      errors: errors.array(),
      requestId: req.id,
    })
    throw new ValidationError(errorMessages)
  }
  next()
}

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  "/register",
  authLimiter,
  validateRegistration,
  checkValidation,
  asyncHandler(async (req, res) => {
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
      postalCode,
    } = req.body

    logger.info("Registration attempt", {
      email,
      phoneNumber,
      requestId: req.id,
    })

    // * Check if user already exists
    const existingUser = await User.findByEmail(email)
    if (existingUser) {
      throw new ValidationError("User with this email already exists")
    }

    // * Check if phone number already exists
    const existingPhone = await User.findByPhoneNumber(phoneNumber)
    if (existingPhone) {
      throw new ValidationError("User with this phone number already exists")
    }

    // * Check if driver license already exists
    if (driverLicenseNumber) {
      const existingLicense =
        await User.findByDriverLicense(driverLicenseNumber)
      if (existingLicense) {
        throw new ValidationError(
          "User with this driver license number already exists"
        )
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
      postalCode,
    })

    // * Generate verification token
    const verificationToken = user.generateEmailVerificationToken()
    await user.save()

    // * Send verification email
    try {
      await sendEmail({
        to: user.email,
        subject: "Verify Your Email - Las Piñas Traffic Payment System",
        template: "emailVerification",
        data: {
          name: user.getFullName(),
          verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`,
        },
      })
    } catch (error) {
      logger.error("Failed to send verification email:", error)
    }

    // * Generate tokens
    const token = generateToken(user.id)
    const refreshToken = generateRefreshToken(user.id)

    logger.info("User registered successfully", {
      userId: user.id,
      email: user.email,
      requestId: req.id,
    })

    attachCsrfToken(res, user.id, "registration")

    res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please check your email for verification.",
      data: {
        user: user.toJSON(),
        token,
        refreshToken,
      },
    })
  })
)

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  "/login",
  authLimiter,
  validateLogin,
  checkValidation,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body

    logger.info("Login attempt", { email, requestId: req.id })

    // * Find user by email
    const user = await User.findByEmail(email)
    if (!user) {
      throw new AuthenticationError("Invalid email or password")
    }

    // * Check if account is locked
    if (user.isLocked()) {
      throw new AuthenticationError(
        "Account is temporarily locked due to multiple failed login attempts"
      )
    }

    // * Check if account is active
    if (!user.isActive) {
      throw new AuthenticationError(
        "Account is deactivated. Please contact administrator"
      )
    }

    // * Verify password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      await user.incrementLoginAttempts()
      throw new AuthenticationError("Invalid email or password")
    }

    // * Reset login attempts on successful login
    await user.resetLoginAttempts()

    // * Generate tokens
    const token = generateToken(user.id)
    const refreshToken = generateRefreshToken(user.id)

    logger.info("Login successful", {
      userId: user.id,
      email: user.email,
      requestId: req.id,
    })

    attachCsrfToken(res, user.id, "login")

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: user.toJSON(),
        token,
        refreshToken,
      },
    })
  })
)

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body

    if (!refreshToken) {
      throw new AuthenticationError("Refresh token is required")
    }

    // * Verify refresh token
    const decoded = verifyRefreshToken(refreshToken)

    // * Find user
    const user = await User.findByPk(decoded.userId)
    if (!user || !user.isActive) {
      throw new AuthenticationError("Invalid refresh token")
    }

    // * Blacklist old refresh token (token rotation)
    try {
      const refreshDecoded = jwt.decode(refreshToken)
      const refreshExpiresAt = refreshDecoded.exp
        ? refreshDecoded.exp * 1000
        : Date.now() + 7 * 24 * 60 * 60 * 1000
      blacklistRefreshToken(refreshToken, refreshExpiresAt)
    } catch (error) {
      logger.warn("Failed to blacklist old refresh token:", error)
    }

    // * Generate new tokens
    const newToken = generateToken(user.id)
    const newRefreshToken = generateRefreshToken(user.id)

    attachCsrfToken(res, user.id, "token refresh")

    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
      },
    })
  })
)

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post(
  "/forgot-password",
  passwordResetLimiter,
  validatePasswordReset,
  checkValidation,
  asyncHandler(async (req, res) => {
    const { email } = req.body

    // * Find user by email
    const user = await User.findByEmail(email)
    if (!user) {
      // * Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message:
          "If an account with that email exists, a password reset link has been sent.",
      })
    }

    // * Generate password reset token
    const resetToken = user.generatePasswordResetToken()
    await user.save()

    // * Send password reset email
    // * Note: Token is NOT included in URL for security. Frontend should use POST with token in body.
    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset - Las Piñas Traffic Payment System",
        template: "passwordReset",
        data: {
          name: user.getFullName(),
          resetUrl: `${process.env.FRONTEND_URL}/reset-password`,
          resetToken: resetToken, // Token sent separately, not in URL
          expiresIn: "30 minutes",
        },
      })
    } catch (error) {
      logger.error("Failed to send password reset email:", error)
    }

    res.json({
      success: true,
      message:
        "If an account with that email exists, a password reset link has been sent.",
    })
  })
)

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  "/reset-password",
  passwordResetLimiter,
  validatePasswordUpdate,
  checkValidation,
  asyncHandler(async (req, res) => {
    const { token, password } = req.body

    // * Find user by reset token
    const user = await User.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { [require("sequelize").Op.gt]: new Date() },
      },
    })

    if (!user) {
      throw new ValidationError("Invalid or expired reset token")
    }

    // * Update password
    user.password = password
    user.passwordResetToken = null
    user.passwordResetExpires = null
    await user.save()

    res.json({
      success: true,
      message: "Password has been reset successfully",
    })
  })
)

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email with token
 * @access  Public
 */
router.post(
  "/verify-email",
  asyncHandler(async (req, res) => {
    const { token } = req.body

    if (!token) {
      throw new ValidationError("Verification token is required")
    }

    // * Find user by verification token
    const user = await User.findOne({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: { [require("sequelize").Op.gt]: new Date() },
      },
    })

    if (!user) {
      throw new ValidationError("Invalid or expired verification token")
    }

    // * Mark email as verified
    user.isEmailVerified = true
    user.emailVerificationToken = null
    user.emailVerificationExpires = null
    await user.save()

    res.json({
      success: true,
      message: "Email verified successfully",
    })
  })
)

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification
 * @access  Public
 */
router.post(
  "/resend-verification",
  validatePasswordReset,
  checkValidation,
  asyncHandler(async (req, res) => {
    const { email } = req.body

    // * Find user by email
    const user = await User.findByEmail(email)
    if (!user) {
      throw new NotFoundError("User not found")
    }

    if (user.isEmailVerified) {
      throw new ValidationError("Email is already verified")
    }

    // * Generate new verification token
    const verificationToken = user.generateEmailVerificationToken()
    await user.save()

    // * Send verification email
    try {
      await sendEmail({
        to: user.email,
        subject: "Verify Your Email - Las Piñas Traffic Payment System",
        template: "emailVerification",
        data: {
          name: user.getFullName(),
          verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`,
        },
      })
    } catch (error) {
      logger.error("Failed to send verification email:", error)
    }

    res.json({
      success: true,
      message: "Verification email sent successfully",
    })
  })
)

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  "/me",
  auth,
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      data: {
        user: req.user.toJSON(),
      },
    })
  })
)

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and blacklist tokens
 * @access  Private
 */
router.post(
  "/logout",
  auth,
  asyncHandler(async (req, res) => {
    const token = req.token
    const refreshToken = req.body.refreshToken || req.get("X-Refresh-Token")

    try {
      // * Decode token to get expiration
      const decoded = jwt.decode(token)
      const expiresAt = decoded.exp
        ? decoded.exp * 1000
        : Date.now() + 24 * 60 * 60 * 1000 // Default to 24h if no exp

      // * Blacklist access token
      blacklistToken(token, expiresAt)

      // * Blacklist refresh token if provided
      if (refreshToken) {
        try {
          const refreshDecoded = jwt.decode(refreshToken)
          const refreshExpiresAt = refreshDecoded.exp
            ? refreshDecoded.exp * 1000
            : Date.now() + 7 * 24 * 60 * 60 * 1000
          blacklistRefreshToken(refreshToken, refreshExpiresAt)
        } catch (error) {
          logger.warn("Failed to blacklist refresh token:", error)
        }
      }

      logger.info("User logged out", { userId: req.user.id })

      res.json({
        success: true,
        message: "Logged out successfully",
      })
    } catch (error) {
      logger.error("Logout error:", error)
      // * Still return success to prevent token reuse even if blacklisting fails
      res.json({
        success: true,
        message: "Logged out successfully",
      })
    }
  })
)

module.exports = router
