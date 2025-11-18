/**
 * Migration script to add enforcer_badge_number column to users table
 * Run this once to add the missing column
 */

require('dotenv').config();
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

const addEnforcerBadgeToUsers = async () => {
  try {
    logger.info('Adding enforcer_badge_number column to users table...');
    
    // * Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');
    
    const dialect = sequelize.getDialect();
    
    if (dialect === 'sqlite') {
      // * For SQLite, we need to check if column exists first
      const [results] = await sequelize.query(`
        PRAGMA table_info(users);
      `);
      
      const columnExists = results.some(col => col.name === 'enforcer_badge_number');
      
      if (columnExists) {
        logger.info('Column enforcer_badge_number already exists in users table. Skipping...');
        return;
      }
      
      // * SQLite doesn't support ALTER TABLE ADD COLUMN with NOT NULL and no default
      // * So we add it as nullable
      logger.info('Adding enforcer_badge_number column (nullable)...');
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN enforcer_badge_number VARCHAR(20);
      `);
      
      // * Update existing enforcer users with a default badge number
      logger.info('Updating existing enforcer users with default badge numbers...');
      await sequelize.query(`
        UPDATE users 
        SET enforcer_badge_number = 'ENF-' || SUBSTR(id, 1, 8)
        WHERE role = 'enforcer' AND enforcer_badge_number IS NULL;
      `);
      
      logger.info('Column enforcer_badge_number added to users table successfully.');
    } else {
      // * For PostgreSQL and other databases
      logger.info('Adding enforcer_badge_number column to users table...');
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS enforcer_badge_number VARCHAR(20);
      `);
      
      // * Update existing enforcer users
      logger.info('Updating existing enforcer users with default badge numbers...');
      await sequelize.query(`
        UPDATE users 
        SET enforcer_badge_number = 'ENF-' || SUBSTRING(id::text, 1, 8)
        WHERE role = 'enforcer' AND enforcer_badge_number IS NULL;
      `);
      
      logger.info('Column enforcer_badge_number added to users table successfully.');
    }
    
    logger.info('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
};

addEnforcerBadgeToUsers();





