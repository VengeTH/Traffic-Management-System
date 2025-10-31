/**
 * Model Associations
 * Defines relationships between database models
 */

const User = require('./User');
const Violation = require('./Violation');
const Payment = require('./Payment');
const Notification = require('./Notification');

// * User - Violation Associations
User.hasMany(Violation, {
  foreignKey: 'enforcerId',
  as: 'enforcedViolations',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

Violation.belongsTo(User, {
  foreignKey: 'enforcerId',
  as: 'enforcer',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

// * User - Payment Associations
User.hasMany(Payment, {
  foreignKey: 'payerId',
  as: 'payments',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

Payment.belongsTo(User, {
  foreignKey: 'payerId',
  as: 'payer',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

// * Violation - Payment Associations
Violation.hasMany(Payment, {
  foreignKey: 'violationId',
  as: 'payments',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

Payment.belongsTo(Violation, {
  foreignKey: 'violationId',
  as: 'violation',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

// * Refund associations
User.hasMany(Payment, {
  foreignKey: 'refundedBy',
  as: 'refundedPayments',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

Payment.belongsTo(User, {
  foreignKey: 'refundedBy',
  as: 'refundedByUser',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

// * User - Notification Associations
User.hasMany(Notification, {
  foreignKey: 'userId',
  as: 'notifications',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Notification.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

module.exports = {
  User,
  Violation,
  Payment,
  Notification
};



