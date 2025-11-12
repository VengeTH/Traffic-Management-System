/**
 * User Model
 * Handles user authentication, roles, and profile information
 */

const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // * Basic Information
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      len: [2, 50],
      is: /^[a-zA-Z\s]+$/
    }
  },
  
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      len: [2, 50],
      is: /^[a-zA-Z\s]+$/
    }
  },
  
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      len: [5, 100]
    }
  },
  
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      is: /^\+?[1-9]\d{1,14}$/
    }
  },
  
  // * Authentication
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [8, 255]
    }
  },
  
  // * Role and Permissions
  role: {
    type: DataTypes.ENUM('citizen', 'admin', 'enforcer'),
    defaultValue: 'citizen',
    allowNull: false
  },
  
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  isPhoneVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // * Two-Factor Authentication
  twoFactorEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  twoFactorSecret: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  
  // * Profile Information
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: true,
      isPast(value) {
        if (value && new Date(value) >= new Date()) {
          throw new Error('Date of birth must be in the past');
        }
      }
    }
  },
  
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  city: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  
  postalCode: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  
  // * Driver Information
  driverLicenseNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
    validate: {
      len: [5, 20]
    }
  },
  
  licenseExpiryDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: true
    }
  },
  
  // * Security and Tracking
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  loginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  lockedUntil: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  passwordResetToken: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  
  passwordResetExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  emailVerificationToken: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  
  emailVerificationExpires: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  
  // * Hooks
  hooks: {
    // * Hash password before saving
    beforeCreate: async (user) => {
      if (user.password) {
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        user.password = await bcrypt.hash(user.password, saltRounds);
      }
    },
    
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        user.password = await bcrypt.hash(user.password, saltRounds);
      }
    }
  },
  
  // * Instance methods
  instanceMethods: {
    // * Compare password
    async comparePassword(candidatePassword) {
      return await bcrypt.compare(candidatePassword, this.password);
    },
    
    // * Check if account is locked
    isLocked() {
      return this.lockedUntil && this.lockedUntil > new Date();
    },
    
    // * Increment login attempts
    async incrementLoginAttempts() {
      this.loginAttempts += 1;
      
      // * Lock account after 5 failed attempts for 15 minutes
      if (this.loginAttempts >= 5) {
        this.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      
      await this.save();
    },
    
    // * Reset login attempts
    async resetLoginAttempts() {
      this.loginAttempts = 0;
      this.lockedUntil = null;
      this.lastLoginAt = new Date();
      await this.save();
    },
    
    // * Generate password reset token
    generatePasswordResetToken() {
      const crypto = require('crypto');
      this.passwordResetToken = crypto.randomBytes(32).toString('hex');
      this.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      return this.passwordResetToken;
    },
    
    // * Generate email verification token
    generateEmailVerificationToken() {
      const crypto = require('crypto');
      this.emailVerificationToken = crypto.randomBytes(32).toString('hex');
      this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      return this.emailVerificationToken;
    },
    
    // * Get full name
    getFullName() {
      return `${this.firstName} ${this.lastName}`;
    },
    
    // * Check if user can perform admin actions
    canPerformAdminAction() {
      return this.role === 'admin' && this.isActive;
    },
    
    // * Check if user can perform enforcer actions
    canPerformEnforcerAction() {
      return (this.role === 'enforcer' || this.role === 'admin') && this.isActive;
    }
  },
  
  // * Class methods
  classMethods: {
    // * Find by email
    async findByEmail(email) {
      return await this.findOne({ where: { email: email.toLowerCase() } });
    },
    
    // * Find by phone number
    async findByPhoneNumber(phoneNumber) {
      return await this.findOne({ where: { phoneNumber } });
    },
    
    // * Find by driver license number
    async findByDriverLicense(driverLicenseNumber) {
      return await this.findOne({ where: { driverLicenseNumber } });
    },
    
    // * Create admin user
    async createAdmin(adminData) {
      return await this.create({
        ...adminData,
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true
      });
    }
  }
});

// * Add class methods directly to User model
User.findByEmail = async function(email) {
  return await this.findOne({ where: { email: email.toLowerCase() } });
};

User.findByPhoneNumber = async function(phoneNumber) {
  return await this.findOne({ where: { phoneNumber } });
};

User.findByDriverLicense = async function(driverLicenseNumber) {
  return await this.findOne({ where: { driverLicenseNumber } });
};

User.createAdmin = async function(adminData) {
  return await this.create({
    ...adminData,
    role: 'admin',
    isActive: true,
    isEmailVerified: true,
    isPhoneVerified: true
  });
};

// * Add instance methods directly to User prototype
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.isLocked = function() {
  return this.lockedUntil && this.lockedUntil > new Date();
};

User.prototype.incrementLoginAttempts = async function() {
  this.loginAttempts += 1;
  
  // * Lock account after 5 failed attempts for 15 minutes
  if (this.loginAttempts >= 5) {
    this.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
  }
  
  await this.save();
};

User.prototype.resetLoginAttempts = async function() {
  this.loginAttempts = 0;
  this.lockedUntil = null;
  this.lastLoginAt = new Date();
  await this.save();
};

User.prototype.generatePasswordResetToken = function() {
  const crypto = require('crypto');
  this.passwordResetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes (reduced from 1 hour for security)
  return this.passwordResetToken;
};

User.prototype.generateEmailVerificationToken = function() {
  const crypto = require('crypto');
  this.emailVerificationToken = crypto.randomBytes(32).toString('hex');
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return this.emailVerificationToken;
};

User.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

User.prototype.canPerformAdminAction = function() {
  return this.role === 'admin' && this.isActive;
};

User.prototype.canPerformEnforcerAction = function() {
  return (this.role === 'enforcer' || this.role === 'admin') && this.isActive;
};

// * Virtual fields
User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password;
  delete values.twoFactorSecret;
  delete values.passwordResetToken;
  delete values.passwordResetExpires;
  delete values.emailVerificationToken;
  delete values.emailVerificationExpires;
  return values;
};

module.exports = User;

