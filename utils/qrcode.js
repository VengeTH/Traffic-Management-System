/**
 * QR Code Utility
 * Generate QR codes for receipts and violations
 */

const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs').promises;
const logger = require('./logger');

// * Generate QR code and save to file
const generateQRCode = async (data, filename) => {
  try {
    // * Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../uploads');
    const qrDir = path.join(uploadsDir, 'qrcodes');
    
    try {
      await fs.access(qrDir);
    } catch {
      await fs.mkdir(qrDir, { recursive: true });
    }
    
    // * Generate QR code as PNG
    const qrCodePath = path.join(qrDir, `${filename}.png`);
    const qrCodeUrl = `/uploads/qrcodes/${filename}.png`;
    
    // * Generate QR code
    await QRCode.toFile(qrCodePath, data, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });
    
    logger.info('QR code generated successfully:', {
      filename,
      path: qrCodePath,
      url: qrCodeUrl
    });
    
    return qrCodeUrl;
    
  } catch (error) {
    logger.error('Failed to generate QR code:', error);
    throw error;
  }
};

// * Generate QR code as data URL
const generateQRCodeDataURL = async (data) => {
  try {
    const dataURL = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });
    
    return dataURL;
    
  } catch (error) {
    logger.error('Failed to generate QR code data URL:', error);
    throw error;
  }
};

// * Generate QR code as SVG
const generateQRCodeSVG = async (data) => {
  try {
    const svg = await QRCode.toString(data, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });
    
    return svg;
    
  } catch (error) {
    logger.error('Failed to generate QR code SVG:', error);
    throw error;
  }
};

// * Delete QR code file
const deleteQRCode = async (filename) => {
  try {
    const qrCodePath = path.join(__dirname, '../uploads/qrcodes', `${filename}.png`);
    
    try {
      await fs.unlink(qrCodePath);
      logger.info('QR code deleted successfully:', { filename });
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      // * File doesn't exist, which is fine
    }
    
  } catch (error) {
    logger.error('Failed to delete QR code:', error);
    throw error;
  }
};

// * Generate QR code for receipt
const generateReceiptQRCode = async (payment) => {
  const qrData = payment.generateQRCodeData();
  const filename = `receipt_${payment.receiptNumber}`;
  
  return await generateQRCode(qrData, filename);
};

// * Generate QR code for violation
const generateViolationQRCode = async (violation) => {
  const qrData = violation.generateQRData();
  const filename = `violation_${violation.ovrNumber}`;
  
  return await generateQRCode(qrData, filename);
};

// * Generate QR code for payment verification
const generatePaymentVerificationQRCode = async (paymentId, amount) => {
  const qrData = JSON.stringify({
    paymentId,
    amount,
    timestamp: new Date().toISOString(),
    type: 'payment_verification'
  });
  
  const filename = `payment_verification_${paymentId}`;
  return await generateQRCode(qrData, filename);
};

module.exports = {
  generateQRCode,
  generateQRCodeDataURL,
  generateQRCodeSVG,
  deleteQRCode,
  generateReceiptQRCode,
  generateViolationQRCode,
  generatePaymentVerificationQRCode
};



