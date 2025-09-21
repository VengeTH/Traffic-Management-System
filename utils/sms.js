/**
 * SMS Utility
 * Handles SMS sending using Twilio
 */

const logger = require('./logger');

// * Initialize Twilio client conditionally
let twilioClient = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    const twilio = require('twilio');
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    logger.info('Twilio client initialized successfully');
  } catch (error) {
    logger.warn('Failed to initialize Twilio client:', error.message);
    twilioClient = null;
  }
} else {
  logger.warn('Twilio credentials not provided, SMS functionality will be disabled');
}

// * Send SMS
const sendSMS = async ({ to, message, from = process.env.TWILIO_PHONE_NUMBER }) => {
  try {
    // * Check if Twilio client is available
    if (!twilioClient) {
      logger.warn('SMS not sent: Twilio client not available');
      return { success: false, message: 'SMS service not configured' };
    }

    // * Validate phone number format
    if (!to || !to.match(/^\+?[1-9]\d{1,14}$/)) {
      throw new Error('Invalid phone number format');
    }
    
    // * Ensure phone number has country code
    const formattedNumber = to.startsWith('+') ? to : `+${to}`;
    
    // * Send SMS
    const result = await twilioClient.messages.create({
      body: message,
      from: from,
      to: formattedNumber
    });
    
    logger.info('SMS sent successfully:', {
      messageId: result.sid,
      to: formattedNumber,
      status: result.status
    });
    
    return result;
    
  } catch (error) {
    logger.error('Failed to send SMS:', error);
    throw error;
  }
};

// * Send violation notification SMS
const sendViolationNotificationSMS = async (violation, paymentUrl) => {
  const message = `Las Piñas Traffic Violation Notice\n\n` +
    `OVR: ${violation.ovrNumber}\n` +
    `Citation: ${violation.citationNumber}\n` +
    `Plate: ${violation.plateNumber}\n` +
    `Violation: ${violation.violationType.replace('_', ' ').toUpperCase()}\n` +
    `Location: ${violation.violationLocation}\n` +
    `Date: ${violation.violationDate.toLocaleDateString('en-PH')}\n` +
    `Fine: ₱${violation.totalFine.toFixed(2)}\n` +
    `Due: ${violation.dueDate}\n\n` +
    `Pay online: ${paymentUrl}\n\n` +
    `Reply STOP to unsubscribe`;
  
  return await sendSMS({
    to: violation.driverPhone,
    message
  });
};

// * Send payment confirmation SMS
const sendPaymentConfirmationSMS = async (payment, violation) => {
  const message = `Las Piñas Traffic Payment Confirmation\n\n` +
    `Receipt: ${payment.receiptNumber}\n` +
    `OVR: ${payment.ovrNumber}\n` +
    `Amount: ₱${payment.totalAmount.toFixed(2)}\n` +
    `Method: ${payment.paymentMethod.toUpperCase()}\n` +
    `Date: ${payment.completedAt.toLocaleDateString('en-PH')}\n\n` +
    `Thank you for your payment!\n\n` +
    `Reply STOP to unsubscribe`;
  
  return await sendSMS({
    to: payment.payerPhone,
    message
  });
};

// * Send payment reminder SMS
const sendPaymentReminderSMS = async (violation, paymentUrl) => {
  const daysUntilDue = violation.daysUntilDue();
  
  const message = `Las Piñas Traffic Payment Reminder\n\n` +
    `OVR: ${violation.ovrNumber}\n` +
    `Fine: ₱${violation.totalFine.toFixed(2)}\n` +
    `Due: ${violation.dueDate}\n` +
    `Days left: ${daysUntilDue}\n\n` +
    `Pay online: ${paymentUrl}\n\n` +
    `Reply STOP to unsubscribe`;
  
  return await sendSMS({
    to: violation.driverPhone,
    message
  });
};

// * Send overdue payment SMS
const sendOverduePaymentSMS = async (violation, paymentUrl) => {
  const message = `URGENT: Las Piñas Traffic Payment Overdue\n\n` +
    `OVR: ${violation.ovrNumber}\n` +
    `Fine: ₱${violation.totalFine.toFixed(2)}\n` +
    `Due: ${violation.dueDate}\n\n` +
    `Additional penalties may apply.\n` +
    `Pay immediately: ${paymentUrl}\n\n` +
    `Reply STOP to unsubscribe`;
  
  return await sendSMS({
    to: violation.driverPhone,
    message
  });
};

// * Send verification code SMS
const sendVerificationCodeSMS = async (phoneNumber, code) => {
  const message = `Las Piñas Traffic Payment System\n\n` +
    `Your verification code is: ${code}\n\n` +
    `This code will expire in 10 minutes.\n` +
    `Do not share this code with anyone.\n\n` +
    `Reply STOP to unsubscribe`;
  
  return await sendSMS({
    to: phoneNumber,
    message
  });
};

// * Send two-factor authentication SMS
const sendTwoFactorSMS = async (phoneNumber, code) => {
  const message = `Las Piñas Traffic Payment System\n\n` +
    `Your 2FA code is: ${code}\n\n` +
    `This code will expire in 5 minutes.\n` +
    `Do not share this code with anyone.\n\n` +
    `Reply STOP to unsubscribe`;
  
  return await sendSMS({
    to: phoneNumber,
    message
  });
};

// * Generate verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// * Validate phone number
const validatePhoneNumber = (phoneNumber) => {
  return phoneNumber && phoneNumber.match(/^\+?[1-9]\d{1,14}$/);
};

// * Format phone number
const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return null;
  
  // * Remove all non-digit characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // * Ensure it starts with +
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
};

module.exports = {
  sendSMS,
  sendViolationNotificationSMS,
  sendPaymentConfirmationSMS,
  sendPaymentReminderSMS,
  sendOverduePaymentSMS,
  sendVerificationCodeSMS,
  sendTwoFactorSMS,
  generateVerificationCode,
  validatePhoneNumber,
  formatPhoneNumber
};

