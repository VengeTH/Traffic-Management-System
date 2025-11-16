/**
 * Payment Model
 * Handles payment transactions, receipts, and payment gateway integration
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // * Payment Reference
  paymentId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [10, 50]
    }
  },
  
  // * Violation Reference
  violationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'violations',
      key: 'id'
    }
  },
  
  ovrNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      len: [10, 20]
    }
  },
  
  citationNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      len: [10, 20]
    }
  },
  
  // * Payer Information
  payerId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  
  payerName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  
  payerEmail: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      isEmail: true,
      len: [5, 100]
    }
  },
  
  payerPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      is: /^\+?[1-9]\d{1,14}$/
    }
  },
  
  // * Payment Details
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'PHP',
    allowNull: false,
    validate: {
      len: 3
    }
  },
  
  paymentMethod: {
    type: DataTypes.ENUM(
      'gcash',
      'maya',
      'paymongo',
      'dragonpay',
      'credit_card',
      'debit_card',
      'bank_transfer',
      'cash',
      'other'
    ),
    allowNull: false
  },
  
  paymentProvider: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      len: [2, 50]
    }
  },
  
  // * Payment Status
  status: {
    type: DataTypes.ENUM(
      'pending',
      'processing',
      'completed',
      'failed',
      'cancelled',
      'refunded',
      'disputed'
    ),
    defaultValue: 'pending',
    allowNull: false
  },
  
  // * Payment Gateway Information
  gatewayTransactionId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'External payment gateway transaction ID'
  },
  
  gatewayReference: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'External payment gateway reference number'
  },
  
  gatewayResponse: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Full response from payment gateway'
  },
  
  // * Receipt Information
  receiptNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
    validate: {
      len: [10, 20]
    }
  },
  
  receiptUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  
  qrCodeData: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'QR code data for receipt verification'
  },
  
  qrCodeUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  
  // * Processing Information
  processingFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  
  // * Timestamps
  initiatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  failedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // * Error Information
  errorCode: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // * Notification Tracking
  receiptEmailSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  receiptSMSSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // * Audit Information
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
    validate: {
      isIP: true
    }
  },
  
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // * Refund Information
  refundAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  
  refundReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  refundedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  refundedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'payments',
  
  // * Indexes for performance
  indexes: [
    {
      fields: [{ name: 'payment_id' }]
    },
    {
      fields: [{ name: 'ovr_number' }]
    },
    {
      fields: [{ name: 'citation_number' }]
    },
    {
      fields: [{ name: 'status' }]
    },
    {
      fields: [{ name: 'payment_method' }]
    },
    {
      fields: [{ name: 'gateway_transaction_id' }]
    },
    {
      fields: [{ name: 'receipt_number' }]
    },
    {
      fields: [{ name: 'initiated_at' }]
    }
  ],
  
  // * Instance methods
  instanceMethods: {
    // * Mark payment as processing
    async markAsProcessing() {
      this.status = 'processing';
      this.processedAt = new Date();
      await this.save();
    },
    
    // * Mark payment as completed
    async markAsCompleted(gatewayTransactionId, gatewayReference, gatewayResponse) {
      this.status = 'completed';
      this.completedAt = new Date();
      this.gatewayTransactionId = gatewayTransactionId;
      this.gatewayReference = gatewayReference;
      this.gatewayResponse = gatewayResponse;
      await this.save();
    },
    
    // * Mark payment as failed
    async markAsFailed(errorCode, errorMessage) {
      this.status = 'failed';
      this.failedAt = new Date();
      this.errorCode = errorCode;
      this.errorMessage = errorMessage;
      await this.save();
    },
    
    // * Mark payment as cancelled
    async markAsCancelled() {
      this.status = 'cancelled';
      await this.save();
    },
    
    // * Process refund
    async processRefund(refundAmount, refundReason, refundedBy) {
      this.status = 'refunded';
      this.refundAmount = refundAmount;
      this.refundReason = refundReason;
      this.refundedAt = new Date();
      this.refundedBy = refundedBy;
      await this.save();
    },
    
    // * Generate receipt number
    generateReceiptNumber() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      return `RCP${year}${month}${random}`;
    },
    
    // * Generate QR code data for receipt
    generateQRCodeData() {
      return JSON.stringify({
        receiptNumber: this.receiptNumber,
        paymentId: this.paymentId,
        amount: this.totalAmount,
        date: this.completedAt,
        ovrNumber: this.ovrNumber
      });
    },
    
    // * Check if payment can be refunded
    canBeRefunded() {
      return this.status === 'completed' && this.refundAmount === 0;
    },
    
    // * Get payment duration
    getPaymentDuration() {
      if (!this.initiatedAt || !this.completedAt) {
        return null;
      }
      return this.completedAt - this.initiatedAt;
    }
  },
  
  // * Class methods
  classMethods: {
    // * Find by payment ID
    async findByPaymentId(paymentId) {
      return await this.findOne({ where: { paymentId } });
    },
    
    // * Find by receipt number
    async findByReceiptNumber(receiptNumber) {
      return await this.findOne({ where: { receiptNumber } });
    },
    
    // * Find by gateway transaction ID
    async findByGatewayTransactionId(gatewayTransactionId) {
      return await this.findOne({ where: { gatewayTransactionId } });
    },
    
    // * Get payments by status
    async getPaymentsByStatus(status) {
      return await this.findAll({
        where: { status },
        order: [['initiatedAt', 'DESC']]
      });
    },
    
    // * Get payments by date range
    async getPaymentsByDateRange(startDate, endDate) {
      return await this.findAll({
        where: {
          initiatedAt: {
            [sequelize.Op.between]: [startDate, endDate]
          }
        },
        order: [['initiatedAt', 'DESC']]
      });
    },
    
    // * Get payments by payment method
    async getPaymentsByMethod(paymentMethod) {
      return await this.findAll({
        where: { paymentMethod },
        order: [['initiatedAt', 'DESC']]
      });
    },
    
    // * Generate payment ID
    generatePaymentId() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
      return `PAY${year}${month}${random}`;
    },
    
    // * Get payment statistics
    async getPaymentStatistics(startDate, endDate) {
      const stats = await this.findAll({
        where: {
          initiatedAt: {
            [sequelize.Op.between]: [startDate, endDate]
          }
        },
        attributes: [
          'status',
          'paymentMethod',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalAmount']
        ],
        group: ['status', 'paymentMethod']
      });
      
      return stats;
    }
  }
});

// * Static methods (Sequelize v6 does not support classMethods in define options)
Payment.generatePaymentId = function() {
	const date = new Date();
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
	return `PAY${year}${month}${random}`;
};

// * Find by payment ID
Payment.findByPaymentId = async function(paymentId) {
	return await this.findOne({ where: { paymentId } });
};

// * Find by receipt number
Payment.findByReceiptNumber = async function(receiptNumber) {
	return await this.findOne({ where: { receiptNumber } });
};

// * Find by gateway transaction ID
Payment.findByGatewayTransactionId = async function(gatewayTransactionId) {
	return await this.findOne({ where: { gatewayTransactionId } });
};

// * Get payments by status
Payment.getPaymentsByStatus = async function(status) {
	const { Op } = require('sequelize');
	return await this.findAll({
		where: { status },
		order: [['initiatedAt', 'DESC']]
	});
};

// * Get payments by date range
Payment.getPaymentsByDateRange = async function(startDate, endDate) {
	const { Op } = require('sequelize');
	return await this.findAll({
		where: {
			initiatedAt: {
				[Op.between]: [startDate, endDate]
			}
		},
		order: [['initiatedAt', 'DESC']]
	});
};

// * Get payments by payment method
Payment.getPaymentsByMethod = async function(paymentMethod) {
	return await this.findAll({
		where: { paymentMethod },
		order: [['initiatedAt', 'DESC']]
	});
};

// * Get payment statistics
Payment.getPaymentStatistics = async function(startDate, endDate) {
	const { Op, fn, col } = require('sequelize');
	const stats = await this.findAll({
		where: {
			initiatedAt: {
				[Op.between]: [startDate, endDate]
			}
		},
		attributes: [
			'status',
			'paymentMethod',
			[fn('COUNT', col('id')), 'count'],
			[fn('SUM', col('totalAmount')), 'totalAmount']
		],
		group: ['status', 'paymentMethod']
	});
	
	return stats;
};

// * Instance methods (attach to prototype)
Payment.prototype.generateReceiptNumber = function() {
	const date = new Date();
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
	return `RCP${year}${month}${random}`;
};

Payment.prototype.generateQRCodeData = function() {
	return JSON.stringify({
		receiptNumber: this.receiptNumber,
		paymentId: this.paymentId,
		amount: this.totalAmount,
		date: this.completedAt,
		ovrNumber: this.ovrNumber
	});
};

// * Mark payment as processing
Payment.prototype.markAsProcessing = async function() {
	this.status = 'processing';
	this.processedAt = new Date();
	await this.save();
};

// * Mark payment as completed
Payment.prototype.markAsCompleted = async function(gatewayTransactionId, gatewayReference, gatewayResponse) {
	this.status = 'completed';
	this.completedAt = new Date();
	if (gatewayTransactionId) {
		this.gatewayTransactionId = gatewayTransactionId;
	}
	if (gatewayReference) {
		this.gatewayReference = gatewayReference;
	}
	if (gatewayResponse) {
		this.gatewayResponse = gatewayResponse;
	}
	await this.save();
};

// * Mark payment as failed
Payment.prototype.markAsFailed = async function(errorCode, errorMessage) {
	this.status = 'failed';
	this.failedAt = new Date();
	this.errorCode = errorCode;
	this.errorMessage = errorMessage;
	await this.save();
};

// * Mark payment as cancelled
Payment.prototype.markAsCancelled = async function() {
	this.status = 'cancelled';
	await this.save();
};

// * Process refund
Payment.prototype.processRefund = async function(refundAmount, refundReason, refundedBy) {
	this.status = 'refunded';
	this.refundAmount = refundAmount;
	this.refundReason = refundReason;
	this.refundedAt = new Date();
	this.refundedBy = refundedBy;
	await this.save();
};

// * Check if payment can be refunded
Payment.prototype.canBeRefunded = function() {
	return this.status === 'completed' && this.refundAmount === 0;
};

// * Get payment duration
Payment.prototype.getPaymentDuration = function() {
	if (!this.initiatedAt || !this.completedAt) {
		return null;
	}
	return this.completedAt - this.initiatedAt;
};

// * Hooks
Payment.beforeCreate(async (payment) => {
  // * Generate payment ID if not provided
  if (!payment.paymentId) {
    payment.paymentId = Payment.generatePaymentId();
  }
  
  // * Calculate total amount
  payment.totalAmount = parseFloat(payment.amount) + parseFloat(payment.processingFee || 0);
  
  // * Generate receipt number
  payment.receiptNumber = payment.generateReceiptNumber();
});

Payment.afterCreate(async (payment) => {
  // * Generate QR code data after creation
  payment.qrCodeData = payment.generateQRCodeData();
  await payment.save();
});

// * Exclude sensitive fields from JSON serialization
Payment.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  // * Exclude sensitive gateway information that may contain secrets
  delete values.gatewayResponse; // May contain sensitive gateway data
  // * Keep other fields as they're needed for receipts and records
  return values;
};

module.exports = Payment;
