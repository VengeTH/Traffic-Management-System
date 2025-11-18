/**
 * Migration script to add enforcer_badge_number column to violations table
 * Run this once to add the missing column
 */

require('dotenv').config();
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

const addEnforcerBadgeColumn = async () => {
  try {
    logger.info('Adding enforcer_badge_number column to violations table...');
    
    // * Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');
    
    const dialect = sequelize.getDialect();
    
    if (dialect === 'sqlite') {
      // * For SQLite, we need to check if column exists first
      const [results] = await sequelize.query(`
        PRAGMA table_info(violations);
      `);
      
      const columnExists = results.some(col => col.name === 'enforcer_badge_number');
      
      if (columnExists) {
        logger.info('Column enforcer_badge_number already exists. Skipping...');
        return;
      }
      
      // * SQLite doesn't support ALTER TABLE ADD COLUMN with NOT NULL and no default
      // * So we add it as nullable first, then update existing rows, then make it NOT NULL
      logger.info('Adding enforcer_badge_number column (nullable)...');
      await sequelize.query(`
        ALTER TABLE violations 
        ADD COLUMN enforcer_badge_number VARCHAR(20);
      `);
      
      // * Update existing rows with a default value
      logger.info('Updating existing rows with default badge numbers...');
      await sequelize.query(`
        UPDATE violations 
        SET enforcer_badge_number = 'ENF-' || SUBSTR(enforcer_id, 1, 8)
        WHERE enforcer_badge_number IS NULL;
      `);
      
      // * Note: SQLite doesn't support changing a column to NOT NULL after creation
      // * The constraint will be enforced by Sequelize at the application level
      logger.info('Column enforcer_badge_number added successfully.');
    } else {
      // * For PostgreSQL and other databases
      logger.info('Adding enforcer_badge_number column...');
      await sequelize.query(`
        ALTER TABLE violations 
        ADD COLUMN IF NOT EXISTS enforcer_badge_number VARCHAR(20);
      `);
      
      // * Update existing rows
      logger.info('Updating existing rows with default badge numbers...');
      await sequelize.query(`
        UPDATE violations 
        SET enforcer_badge_number = 'ENF-' || SUBSTRING(enforcer_id::text, 1, 8)
        WHERE enforcer_badge_number IS NULL;
      `);
      
      // * Make it NOT NULL
      logger.info('Setting column to NOT NULL...');
      await sequelize.query(`
        ALTER TABLE violations 
        ALTER COLUMN enforcer_badge_number SET NOT NULL;
      `);
      
      logger.info('Column enforcer_badge_number added successfully.');
    }
    
    logger.info('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
};

addEnforcerBadgeColumn();



