/**
 * Notification Model
 * Handles in-app notifications for users
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  
  type: {
    type: DataTypes.ENUM('success', 'error', 'warning', 'info'),
    allowNull: false,
    defaultValue: 'info'
  },
  
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  readAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // Optional link to related resource
  linkUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  
  linkText: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'notifications',
  
  indexes: [
    {
      fields: [{ name: 'user_id' }]
    },
    {
      fields: [{ name: 'is_read' }]
    },
    {
      fields: [{ name: 'created_at' }]
    }
  ]
});

// Instance methods
Notification.prototype.markAsRead = async function() {
  this.isRead = true;
  this.readAt = new Date();
  await this.save();
};

// Static methods
Notification.getUnreadCount = async function(userId) {
  return await this.count({
    where: {
      userId,
      isRead: false
    }
  });
};

Notification.getUserNotifications = async function(userId, limit = 50, offset = 0) {
  return await this.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    limit,
    offset
  });
};

module.exports = Notification;

