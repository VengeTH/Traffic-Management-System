/**
 * Violation Model
 * Handles traffic violations, citations, and enforcement records
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Violation = sequelize.define('Violation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // * Violation Reference Numbers
  ovrNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      len: [10, 20]
    }
  },
  
  citationNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      len: [10, 20]
    }
  },
  
  // * Vehicle Information
  plateNumber: {
    type: DataTypes.STRING(15),
    allowNull: false,
    validate: {
      len: [5, 15]
    }
  },
  
  vehicleType: {
    type: DataTypes.ENUM('motorcycle', 'car', 'truck', 'bus', 'tricycle', 'other'),
    allowNull: false
  },
  
  vehicleMake: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  
  vehicleModel: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  
  vehicleColor: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  
  vehicleYear: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1900,
      max: new Date().getFullYear() + 1
    }
  },
  
  // * Driver Information
  driverName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  
  driverLicenseNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: [5, 20]
    }
  },
  
  driverAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  driverPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      is: /^\+?[1-9]\d{1,14}$/
    }
  },
  
  // * Violation Details
  violationType: {
    type: DataTypes.ENUM(
      'speeding',
      'reckless_driving',
      'illegal_parking',
      'no_license_plate',
      'expired_registration',
      'no_drivers_license',
      'driving_under_influence',
      'disregarding_traffic_signals',
      'illegal_overtaking',
      'overloading',
      'no_helmet',
      'no_seatbelt',
      'illegal_turn',
      'blocking_intersection',
      'other'
    ),
    allowNull: false
  },
  
  violationDescription: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  
  violationLocation: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  
  violationDate: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true,
      isPast(value) {
        if (value && new Date(value) > new Date()) {
          throw new Error('Violation date cannot be in the future');
        }
      }
    }
  },
  
  violationTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  
  // * Fine and Penalty Information
  baseFine: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  
  additionalPenalties: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  
  totalFine: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  
  // * Demerit Points
  demeritPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  
  // * Status and Processing
  status: {
    type: DataTypes.ENUM(
      'pending',
      'paid',
      'disputed',
      'dismissed',
      'overdue',
      'cancelled'
    ),
    defaultValue: 'pending',
    allowNull: false
  },
  
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true
    }
  },
  
  paymentDeadline: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true
    }
  },
  
  // * Enforcement Information
  enforcerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  
  enforcerName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  
  enforcerBadgeNumber: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  
  // * Evidence and Documentation
  evidencePhotos: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of photo URLs as evidence'
  },
  
  witnessStatements: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of witness statement objects'
  },
  
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // * Dispute Information
  isDisputed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  disputeReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  disputeDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  disputeStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: true
  },
  
  // * Payment Information
  paymentMethod: {
    type: DataTypes.ENUM('gcash', 'maya', 'paymongo', 'dragonpay', 'credit_card', 'debit_card', 'cash'),
    allowNull: true
  },
  
  paymentReference: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // * Notification Tracking
  smsSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  emailSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  reminderSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // * Audit Fields
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
  tableName: 'violations',
  
  // * Indexes for performance
  indexes: [
    {
      fields: [{ name: 'ovr_number' }]
    },
    {
      fields: [{ name: 'citation_number' }]
    },
    {
      fields: [{ name: 'plate_number' }]
    },
    {
      fields: [{ name: 'driver_license_number' }]
    },
    {
      fields: [{ name: 'status' }]
    },
    {
      fields: [{ name: 'violation_date' }]
    },
    {
      fields: [{ name: 'payment_deadline' }]
    },
    {
      fields: [{ name: 'enforcer_id' }]
    }
  ],
  
  // * Instance methods
  instanceMethods: {
    // * Check if violation is overdue
    isOverdue() {
      return this.status === 'pending' && new Date() > new Date(this.paymentDeadline);
    },
    
    // * Check if violation can be disputed
    canBeDisputed() {
      return this.status === 'pending' && !this.isDisputed;
    },
    
    // * Calculate days until due
    daysUntilDue() {
      const today = new Date();
      const dueDate = new Date(this.paymentDeadline);
      const diffTime = dueDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    },
    
    // * Mark as paid
    async markAsPaid(paymentMethod, paymentReference) {
      this.status = 'paid';
      this.paymentMethod = paymentMethod;
      this.paymentReference = paymentReference;
      this.paymentDate = new Date();
      await this.save();
    },
    
    // * Submit dispute
    async submitDispute(reason) {
      this.isDisputed = true;
      this.disputeReason = reason;
      this.disputeDate = new Date();
      this.disputeStatus = 'pending';
      await this.save();
    },
    
    // * Process dispute
    async processDispute(approved) {
      this.disputeStatus = approved ? 'approved' : 'rejected';
      if (approved) {
        this.status = 'dismissed';
      }
      await this.save();
    },
    
    // * Generate QR code data
    generateQRData() {
      return JSON.stringify({
        ovrNumber: this.ovrNumber,
        citationNumber: this.citationNumber,
        totalFine: this.totalFine,
        dueDate: this.dueDate
      });
    }
  },
  
  // * Class methods
  classMethods: {
    // * Find by OVR number
    async findByOVR(ovrNumber) {
      return await this.findOne({ where: { ovrNumber } });
    },
    
    // * Find by citation number
    async findByCitation(citationNumber) {
      return await this.findOne({ where: { citationNumber } });
    },
    
    // * Find by plate number
    async findByPlateNumber(plateNumber) {
      return await this.findAll({ 
        where: { plateNumber: plateNumber.toUpperCase() },
        order: [['violationDate', 'DESC']]
      });
    },
    
    // * Find by driver license
    async findByDriverLicense(driverLicenseNumber) {
      return await this.findAll({ 
        where: { driverLicenseNumber },
        order: [['violationDate', 'DESC']]
      });
    },
    
    // * Get overdue violations
    async getOverdueViolations() {
      return await this.findAll({
        where: {
          status: 'pending',
          paymentDeadline: {
            [sequelize.Op.lt]: new Date()
          }
        }
      });
    },
    
    // * Get violations by status
    async getViolationsByStatus(status) {
      return await this.findAll({
        where: { status },
        order: [['violationDate', 'DESC']]
      });
    },
    
    // * Get violations by date range
    async getViolationsByDateRange(startDate, endDate) {
      return await this.findAll({
        where: {
          violationDate: {
            [sequelize.Op.between]: [startDate, endDate]
          }
        },
        order: [['violationDate', 'DESC']]
      });
    },
    
    // * Generate OVR number
    generateOVRNumber() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      return `OVR${year}${month}${random}`;
    },
    
    // * Generate citation number
    generateCitationNumber() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      return `CIT${year}${month}${random}`;
    }
  }
});

// * Static methods (Sequelize v6 does not support classMethods option)
Violation.generateOVRNumber = function() {
	const date = new Date();
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
	return `OVR${year}${month}${random}`;
};

Violation.generateCitationNumber = function() {
	const date = new Date();
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
	return `CIT${year}${month}${random}`;
};

// * Add search methods directly to Violation model
Violation.findByOVR = async function(ovrNumber) {
	return await this.findOne({ where: { ovrNumber } });
};

Violation.findByCitation = async function(citationNumber) {
	return await this.findOne({ where: { citationNumber } });
};

Violation.findByPlateNumber = async function(plateNumber) {
	return await this.findAll({ 
		where: { plateNumber: plateNumber.toUpperCase() },
		order: [['violationDate', 'DESC']]
	});
};

Violation.findByDriverLicense = async function(driverLicenseNumber) {
	return await this.findAll({ 
		where: { driverLicenseNumber },
		order: [['violationDate', 'DESC']]
	});
};

Violation.getOverdueViolations = async function() {
	return await this.findAll({
		where: {
			status: 'pending',
			paymentDeadline: {
				[sequelize.Op.lt]: new Date()
			}
		}
	});
};

// * Hooks
Violation.beforeCreate(async (violation) => {
  // * Generate OVR and citation numbers if not provided
  if (!violation.ovrNumber) {
    violation.ovrNumber = Violation.generateOVRNumber();
  }
  
  if (!violation.citationNumber) {
    violation.citationNumber = Violation.generateCitationNumber();
  }
  
  // * Set payment deadline (30 days from violation date)
  if (!violation.paymentDeadline) {
    const deadline = new Date(violation.violationDate);
    deadline.setDate(deadline.getDate() + 30);
    violation.paymentDeadline = deadline;
    violation.dueDate = deadline.toISOString().split('T')[0];
  }
  
  // * Calculate total fine
  violation.totalFine = parseFloat(violation.baseFine) + parseFloat(violation.additionalPenalties || 0);
  
  // * Normalize plate number
  if (violation.plateNumber) {
    violation.plateNumber = violation.plateNumber.toUpperCase();
  }
});

module.exports = Violation;
