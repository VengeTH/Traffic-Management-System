/**
 * Notification Utility
 * Helper functions to create notifications for users
 */

const { Notification } = require('../models');
const logger = require('./logger');

/**
 * Create a notification for a user
 * @param {Object} data - Notification data
 * @param {string} data.userId - User ID
 * @param {string} data.type - Notification type (success, error, warning, info)
 * @param {string} data.title - Notification title
 * @param {string} data.message - Notification message
 * @param {string} [data.linkUrl] - Optional link URL
 * @param {string} [data.linkText] - Optional link text
 * @returns {Promise<Notification>}
 */
async function createNotification({ userId, type, title, message, linkUrl, linkText }) {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      linkUrl,
      linkText
    });
    
    logger.info(`Notification created for user ${userId}: ${title}`);
    return notification;
  } catch (error) {
    logger.error('Failed to create notification:', error);
    throw error;
  }
}

/**
 * Create violation notification
 * @param {string} userId - User ID
 * @param {Object} violation - Violation object
 */
async function createViolationNotification(userId, violation) {
  return await createNotification({
    userId,
    type: 'warning',
    title: 'New Traffic Violation',
    message: `You have received a new traffic violation: ${violation.violationType.replace(/_/g, ' ')}. OVR Number: ${violation.ovrNumber}. Fine: ₱${violation.totalFine.toFixed(2)}`,
    linkUrl: `/violations/${violation.id}`,
    linkText: 'View Violation'
  });
}

/**
 * Create payment confirmation notification
 * @param {string} userId - User ID
 * @param {Object} payment - Payment object
 */
async function createPaymentNotification(userId, payment) {
  return await createNotification({
    userId,
    type: 'success',
    title: 'Payment Successful',
    message: `Your payment of ₱${payment.amount.toFixed(2)} for violation ${payment.ovrNumber} has been completed successfully. Receipt: ${payment.receiptNumber}`,
    linkUrl: `/payments`,
    linkText: 'View Receipt'
  });
}

/**
 * Create overdue payment notification
 * @param {string} userId - User ID
 * @param {Object} violation - Violation object
 */
async function createOverdueNotification(userId, violation) {
  return await createNotification({
    userId,
    type: 'error',
    title: 'Payment Overdue',
    message: `Your payment for violation ${violation.ovrNumber} is overdue. Please pay ₱${violation.totalFine.toFixed(2)} to avoid additional penalties.`,
    linkUrl: `/payment/${violation.id}`,
    linkText: 'Pay Now'
  });
}

/**
 * Create dispute status notification
 * @param {string} userId - User ID
 * @param {Object} violation - Violation object
 * @param {string} status - Dispute status (approved/rejected)
 */
async function createDisputeNotification(userId, violation, status) {
  const isApproved = status === 'approved';
  return await createNotification({
    userId,
    type: isApproved ? 'success' : 'error',
    title: `Dispute ${isApproved ? 'Approved' : 'Rejected'}`,
    message: `Your dispute for violation ${violation.ovrNumber} has been ${status}.`,
    linkUrl: `/violations/${violation.id}`,
    linkText: 'View Details'
  });
}

module.exports = {
  createNotification,
  createViolationNotification,
  createPaymentNotification,
  createOverdueNotification,
  createDisputeNotification
};

