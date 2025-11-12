/**
 * File Upload Security Middleware
 * Validates file uploads to prevent malicious file uploads and path traversal attacks
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// * Allowed file types
const ALLOWED_MIME_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf']
};

// * Maximum file size (5MB default, can be overridden)
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB

// * Allowed file extensions
const ALLOWED_EXTENSIONS = Object.values(ALLOWED_MIME_TYPES).flat();

/**
 * Validate file type
 * @param {string} mimetype - MIME type
 * @param {string} originalname - Original filename
 * @returns {boolean} True if file type is allowed
 */
const isValidFileType = (mimetype, originalname) => {
  // * Check MIME type
  if (!ALLOWED_MIME_TYPES[mimetype]) {
    return false;
  }
  
  // * Check file extension
  const ext = path.extname(originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return false;
  }
  
  // * Ensure extension matches MIME type
  const allowedExts = ALLOWED_MIME_TYPES[mimetype];
  if (!allowedExts.includes(ext)) {
    return false;
  }
  
  return true;
};

/**
 * Sanitize filename to prevent path traversal
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
const sanitizeFilename = (filename) => {
  // * Remove path components
  const basename = path.basename(filename);
  
  // * Remove special characters
  const sanitized = basename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/^\.+/, '') // Remove leading dots
    .substring(0, 255); // Limit length
  
  // * Ensure it's not empty
  if (!sanitized || sanitized === '.' || sanitized === '..') {
    return `file_${Date.now()}`;
  }
  
  return sanitized;
};

// * Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || path.join(__dirname, '../uploads');
    
    // * Ensure upload directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // * Sanitize filename
    const sanitized = sanitizeFilename(file.originalname);
    const ext = path.extname(sanitized);
    const name = path.basename(sanitized, ext);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    
    // * Generate unique filename
    const filename = `${name}_${timestamp}_${random}${ext}`;
    cb(null, filename);
  }
});

// * File filter
const fileFilter = (req, file, cb) => {
  if (isValidFileType(file.mimetype, file.originalname)) {
    cb(null, true);
  } else {
    logger.warn('Invalid file type attempted', {
      mimetype: file.mimetype,
      originalname: file.originalname,
      ip: req.ip
    });
    cb(new Error(`Invalid file type. Allowed types: ${Object.keys(ALLOWED_MIME_TYPES).join(', ')}`), false);
  }
};

// * Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5 // Maximum 5 files per request
  }
});

/**
 * Middleware to handle file upload errors
 */
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        error: 'FILE_TOO_LARGE'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded. Maximum 5 files allowed.',
        error: 'TOO_MANY_FILES'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field',
        error: 'UNEXPECTED_FILE'
      });
    }
  }
  
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: err.message,
      error: 'INVALID_FILE_TYPE'
    });
  }
  
  next(err);
};

module.exports = {
  upload,
  handleUploadError,
  isValidFileType,
  sanitizeFilename,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE
};

