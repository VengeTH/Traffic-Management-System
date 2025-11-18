/**
 * Email Utility
 * Handles email sending using Nodemailer
 */

const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;
const logger = require('./logger');

// * Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// * Email templates
const emailTemplates = {
  emailVerification: {
    subject: 'Verify Your Email - Las Piñas Traffic Payment System',
    template: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #1e40af; color: white; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Las Piñas Traffic Payment System</h1>
          </div>
          <div class="content">
            <h2>Hello {{name}},</h2>
            <p>Thank you for registering with the Las Piñas Traffic Online Payment System. To complete your registration, please verify your email address by clicking the button below:</p>
            <p style="text-align: center;">
              <a href="{{verificationUrl}}" class="button">Verify Email Address</a>
            </p>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p>{{verificationUrl}}</p>
            <p>This verification link will expire in 24 hours.</p>
            <p>If you didn't create an account, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Las Piñas City Government. All rights reserved.</p>
            <p style="font-size: 13px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
              Developed by <a href="https://vengeth.github.io/The-Heedful" style="color: #4b5563; font-weight: 500; text-decoration: underline;">The Heedful</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  
  passwordReset: {
    subject: 'Password Reset - Las Piñas Traffic Payment System',
    template: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello {{name}},</h2>
            <p>We received a request to reset your password for the Las Piñas Traffic Online Payment System. Click the button below to reset your password:</p>
            <p style="text-align: center;">
              <a href="{{resetUrl}}" class="button">Reset Password</a>
            </p>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p>{{resetUrl}}</p>
            <p>This reset link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Las Piñas City Government. All rights reserved.</p>
            <p style="font-size: 13px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
              Developed by <a href="https://vengeth.github.io/The-Heedful" style="color: #4b5563; font-weight: 500; text-decoration: underline;">The Heedful</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  
  paymentReceipt: {
    subject: 'Payment Receipt - Las Piñas Traffic Payment System',
    template: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .receipt { background: white; border: 1px solid #d1d5db; border-radius: 5px; padding: 20px; margin: 20px 0; }
          .receipt-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .total { border-top: 2px solid #d1d5db; padding-top: 10px; font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Receipt</h1>
          </div>
          <div class="content">
            <h2>Hello {{payerName}},</h2>
            <p>Thank you for your payment. Here is your receipt:</p>
            
            <div class="receipt">
              <h3>Payment Details</h3>
              <div class="receipt-row">
                <span>Receipt Number:</span>
                <span>{{receiptNumber}}</span>
              </div>
              <div class="receipt-row">
                <span>OVR Number:</span>
                <span>{{ovrNumber}}</span>
              </div>
              <div class="receipt-row">
                <span>Citation Number:</span>
                <span>{{citationNumber}}</span>
              </div>
              <div class="receipt-row">
                <span>Payment Date:</span>
                <span>{{paymentDate}}</span>
              </div>
              <div class="receipt-row">
                <span>Payment Method:</span>
                <span>{{paymentMethod}}</span>
              </div>
              <div class="receipt-row">
                <span>Violation Type:</span>
                <span>{{violationType}}</span>
              </div>
              <div class="receipt-row">
                <span>Violation Location:</span>
                <span>{{violationLocation}}</span>
              </div>
              <div class="receipt-row">
                <span>Violation Date:</span>
                <span>{{violationDate}}</span>
              </div>
              <div class="receipt-row total">
                <span>Total Amount:</span>
                <span>₱{{totalAmount}}</span>
              </div>
            </div>
            
            <p>This receipt serves as proof of payment. Please keep it for your records.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Las Piñas City Government. All rights reserved.</p>
            <p style="font-size: 13px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
              Developed by <a href="https://vengeth.github.io/The-Heedful" style="color: #4b5563; font-weight: 500; text-decoration: underline;">The Heedful</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  
  violationNotification: {
    subject: 'Traffic Violation Notice - Las Piñas Traffic Payment System',
    template: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Traffic Violation Notice</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .violation { background: white; border: 1px solid #d1d5db; border-radius: 5px; padding: 20px; margin: 20px 0; }
          .violation-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .total { border-top: 2px solid #d1d5db; padding-top: 10px; font-weight: bold; }
          .button { display: inline-block; padding: 12px 24px; background: #1e40af; color: white; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Traffic Violation Notice</h1>
          </div>
          <div class="content">
            <h2>Hello {{driverName}},</h2>
            <p>You have received a traffic violation notice. Please review the details below:</p>
            
            <div class="violation">
              <h3>Violation Details</h3>
              <div class="violation-row">
                <span>OVR Number:</span>
                <span>{{ovrNumber}}</span>
              </div>
              <div class="violation-row">
                <span>Citation Number:</span>
                <span>{{citationNumber}}</span>
              </div>
              <div class="violation-row">
                <span>Plate Number:</span>
                <span>{{plateNumber}}</span>
              </div>
              <div class="violation-row">
                <span>Violation Type:</span>
                <span>{{violationType}}</span>
              </div>
              <div class="violation-row">
                <span>Violation Location:</span>
                <span>{{violationLocation}}</span>
              </div>
              <div class="violation-row">
                <span>Violation Date:</span>
                <span>{{violationDate}}</span>
              </div>
              <div class="violation-row">
                <span>Due Date:</span>
                <span>{{dueDate}}</span>
              </div>
              <div class="violation-row total">
                <span>Total Fine:</span>
                <span>₱{{totalFine}}</span>
              </div>
            </div>
            
            <p style="text-align: center;">
              <a href="{{paymentUrl}}" class="button">Pay Fine Online</a>
            </p>
            
            <p>Please pay the fine before the due date to avoid additional penalties.</p>
            <p>If you believe this violation was issued in error, you may submit a dispute through our online portal.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Las Piñas City Government. All rights reserved.</p>
            <p style="font-size: 13px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
              Developed by <a href="https://vengeth.github.io/The-Heedful" style="color: #4b5563; font-weight: 500; text-decoration: underline;">The Heedful</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  
  overduePayment: {
    subject: 'URGENT: Payment Overdue - Las Piñas Traffic Payment System',
    template: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Overdue</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .violation { background: white; border: 1px solid #d1d5db; border-radius: 5px; padding: 20px; margin: 20px 0; }
          .violation-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .total { border-top: 2px solid #d1d5db; padding-top: 10px; font-weight: bold; }
          .button { display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Overdue</h1>
          </div>
          <div class="content">
            <h2>Hello {{driverName}},</h2>
            <p><strong>URGENT:</strong> Your traffic violation payment is overdue. Please pay immediately to avoid additional penalties.</p>
            
            <div class="violation">
              <h3>Overdue Violation Details</h3>
              <div class="violation-row">
                <span>OVR Number:</span>
                <span>{{ovrNumber}}</span>
              </div>
              <div class="violation-row">
                <span>Citation Number:</span>
                <span>{{citationNumber}}</span>
              </div>
              <div class="violation-row">
                <span>Plate Number:</span>
                <span>{{plateNumber}}</span>
              </div>
              <div class="violation-row">
                <span>Violation Type:</span>
                <span>{{violationType}}</span>
              </div>
              <div class="violation-row">
                <span>Violation Location:</span>
                <span>{{violationLocation}}</span>
              </div>
              <div class="violation-row">
                <span>Violation Date:</span>
                <span>{{violationDate}}</span>
              </div>
              <div class="violation-row">
                <span>Due Date:</span>
                <span>{{dueDate}}</span>
              </div>
              <div class="violation-row total">
                <span>Total Fine:</span>
                <span>₱{{totalFine}}</span>
              </div>
            </div>
            
            <p style="text-align: center;">
              <a href="{{paymentUrl}}" class="button">Pay Now</a>
            </p>
            
            <p><strong>Important:</strong> Additional penalties may apply for late payments. Please settle this immediately to avoid further consequences.</p>
            <p>If you have any questions or need assistance, please contact our support team.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Las Piñas City Government. All rights reserved.</p>
            <p style="font-size: 13px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
              Developed by <a href="https://vengeth.github.io/The-Heedful" style="color: #4b5563; font-weight: 500; text-decoration: underline;">The Heedful</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }
};

// * Replace template variables
const replaceTemplateVariables = (template, data) => {
  let result = template;
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, data[key]);
  });
  return result;
};

// * Send email
const sendEmail = async ({ to, subject, template, data, attachments = [] }) => {
  try {
    const transporter = createTransporter();
    
    // * Get template
    const emailTemplate = emailTemplates[template];
    if (!emailTemplate) {
      throw new Error(`Email template '${template}' not found`);
    }
    
    // * Replace variables in template
    const html = replaceTemplateVariables(emailTemplate.template, data);
    
    // * Email options
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: subject || emailTemplate.subject,
      html,
      attachments
    };
    
    // * Send email
    const info = await transporter.sendMail(mailOptions);
    
    logger.info('Email sent successfully:', {
      messageId: info.messageId,
      to,
      subject: mailOptions.subject
    });
    
    return info;
    
  } catch (error) {
    logger.error('Failed to send email:', error);
    throw error;
  }
};

const formatCurrency = (value) => {
  if (value === undefined || value === null) {
    return '0.00';
  }
  const numericValue = typeof value === 'number' ? value : parseFloat(value);
  if (!Number.isFinite(numericValue)) {
    return '0.00';
  }
  return numericValue.toFixed(2);
};

// * Send verification email
const sendVerificationEmail = async (user, verificationUrl) => {
  return await sendEmail({
    to: user.email,
    template: 'emailVerification',
    data: {
      name: user.getFullName(),
      verificationUrl
    }
  });
};

// * Send password reset email
const sendPasswordResetEmail = async (user, resetUrl) => {
  return await sendEmail({
    to: user.email,
    template: 'passwordReset',
    data: {
      name: user.getFullName(),
      resetUrl
    }
  });
};

// * Send payment receipt
const sendPaymentReceipt = async (payment, violation) => {
  return await sendEmail({
    to: payment.payerEmail,
    template: 'paymentReceipt',
    data: {
      payerName: payment.payerName,
      receiptNumber: payment.receiptNumber,
      ovrNumber: payment.ovrNumber,
      citationNumber: payment.citationNumber,
      paymentDate: payment.completedAt.toLocaleDateString('en-PH'),
      paymentMethod: payment.paymentMethod.toUpperCase(),
      violationType: violation.violationType.replace('_', ' ').toUpperCase(),
      violationLocation: violation.violationLocation,
      violationDate: violation.violationDate.toLocaleDateString('en-PH'),
      totalAmount: formatCurrency(payment.totalAmount)
    }
  });
};

// * Send violation notification
const sendViolationNotification = async (violation, paymentUrl) => {
  return await sendEmail({
    to: violation.driverEmail || 'driver@example.com', // * You might want to add email to violation model
    template: 'violationNotification',
    data: {
      driverName: violation.driverName,
      ovrNumber: violation.ovrNumber,
      citationNumber: violation.citationNumber,
      plateNumber: violation.plateNumber,
      violationType: violation.violationType.replace('_', ' ').toUpperCase(),
      violationLocation: violation.violationLocation,
      violationDate: violation.violationDate.toLocaleDateString('en-PH'),
      dueDate: violation.dueDate,
      totalFine: formatCurrency(violation.totalFine),
      paymentUrl
    }
  });
};

// * Send overdue payment email
const sendOverduePaymentEmail = async (violation, paymentUrl) => {
  return await sendEmail({
    to: violation.driverEmail || 'driver@example.com', // * You might want to add email to violation model
    template: 'overduePayment',
    data: {
      driverName: violation.driverName,
      ovrNumber: violation.ovrNumber,
      citationNumber: violation.citationNumber,
      plateNumber: violation.plateNumber,
      violationType: violation.violationType.replace('_', ' ').toUpperCase(),
      violationLocation: violation.violationLocation,
      violationDate: violation.violationDate.toLocaleDateString('en-PH'),
      dueDate: violation.dueDate,
      totalFine: formatCurrency(violation.totalFine),
      paymentUrl
    }
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPaymentReceipt,
  sendViolationNotification,
  sendOverduePaymentEmail
};
