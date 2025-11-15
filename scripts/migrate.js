/**
 * Database Migration Script
 * Sets up the database schema and tables
 */

require('dotenv').config();
const { sequelize } = require('../config/database');
const { User, Violation, Payment, Notification } = require('../models');
const logger = require('../utils/logger');

const runMigrations = async () => {
  try {
    logger.info('Starting database migration...');
    
    // * Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');
    
    // * Sync models in correct order (respecting foreign key dependencies)
    // * Use alter: false for SQLite to avoid unique constraint issues with NULLs
    const isSQLite = sequelize.getDialect() === 'sqlite';
    const syncOptions = isSQLite ? { force: false, alter: false } : { force: false, alter: true };
    
    logger.info(`Syncing models (alter: ${!isSQLite})...`);
    
    // * 1. User table (no dependencies)
    logger.info('Syncing User model...');
    await User.sync(syncOptions);
    logger.info('User table synchronized successfully.');
    
    // * 2. Violation table (depends on User via enforcer_id)
    logger.info('Syncing Violation model...');
    await Violation.sync(syncOptions);
    logger.info('Violation table synchronized successfully.');
    
    // * 3. Payment table (depends on User and Violation)
    logger.info('Syncing Payment model...');
    await Payment.sync(syncOptions);
    logger.info('Payment table synchronized successfully.');
    
    // * 4. Notification table (depends on User)
    logger.info('Syncing Notification model...');
    await Notification.sync(syncOptions);
    logger.info('Notification table synchronized successfully.');
    
    logger.info('All database tables synchronized successfully.');
    
    // * Create indexes for better performance
    logger.info('Creating database indexes...');
    
    // * User indexes
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
      CREATE INDEX IF NOT EXISTS idx_users_driver_license ON users(driver_license_number);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
    `);
    
    // * Violation indexes
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_violations_ovr ON violations(ovr_number);
      CREATE INDEX IF NOT EXISTS idx_violations_citation ON violations(citation_number);
      CREATE INDEX IF NOT EXISTS idx_violations_plate ON violations(plate_number);
      CREATE INDEX IF NOT EXISTS idx_violations_driver_license ON violations(driver_license_number);
      CREATE INDEX IF NOT EXISTS idx_violations_status ON violations(status);
      CREATE INDEX IF NOT EXISTS idx_violations_date ON violations(violation_date);
      CREATE INDEX IF NOT EXISTS idx_violations_deadline ON violations(payment_deadline);
      CREATE INDEX IF NOT EXISTS idx_violations_enforcer ON violations(enforcer_id);
    `);
    
    // * Payment indexes
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON payments(payment_id);
      CREATE INDEX IF NOT EXISTS idx_payments_ovr ON payments(ovr_number);
      CREATE INDEX IF NOT EXISTS idx_payments_receipt ON payments(receipt_number);
      CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
      CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(payment_method);
      CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(initiated_at);
      CREATE INDEX IF NOT EXISTS idx_payments_payer ON payments(payer_id);
    `);
    
    // * Notification indexes (if using PostgreSQL, indexes are created by model sync)
    // * For SQLite, these are created by the model definition
    if (sequelize.getDialect() === 'postgres') {
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
        CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
        CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
      `);
    }
    
    logger.info('Database indexes created successfully.');
    
    logger.info('Database migration completed successfully!');
    
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

// * Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };



