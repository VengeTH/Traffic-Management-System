/**
 * Database Configuration
 * Sequelize setup for PostgreSQL (with SQLite fallback for development)
 */

const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// * Decide dialect (default postgres). Set DB_DIALECT=sqlite or USE_SQLITE=true for local dev
const shouldUseSqlite = (process.env.DB_DIALECT === 'sqlite') || (process.env.USE_SQLITE === 'true');

let sequelize;

if (shouldUseSqlite) {
	// * Ensure data directory exists
	const dataDir = path.join(__dirname, '..', 'data');
	if (!fs.existsSync(dataDir)) {
		fs.mkdirSync(dataDir, { recursive: true });
	}
	const storagePath = process.env.SQLITE_STORAGE || path.join(dataDir, 'dev.sqlite');

	sequelize = new Sequelize({
		dialect: 'sqlite',
		storage: storagePath,
		logging: process.env.NODE_ENV === 'development' ? (msg) => logger.info(msg) : false,
		define: {
			timestamps: true,
			underscored: true,
			freezeTableName: true
		}
	});
	logger.info(`Using SQLite database at ${storagePath}`);
} else {
	// * PostgreSQL configuration
	sequelize = new Sequelize(
		process.env.DB_NAME || 'las_pinas_traffic_db',
		process.env.DB_USER || 'postgres',
		process.env.DB_PASSWORD || 'password',
		{
			host: process.env.DB_HOST || 'localhost',
			port: process.env.DB_PORT || 5432,
			dialect: 'postgres',
			logging: process.env.NODE_ENV === 'development' ? logger.info : false,
			pool: {
				max: 20,
				min: 0,
				acquire: 30000,
				idle: 10000
			},
			dialectOptions: {
				ssl: process.env.NODE_ENV === 'production' ? {
					require: true,
					rejectUnauthorized: false
				} : false
			},
			define: {
				timestamps: true,
				underscored: true,
				freezeTableName: true
			}
		}
	);
}

// * Test database connection
const testConnection = async () => {
	try {
		await sequelize.authenticate();
		logger.info('✅ Database connection has been established successfully.');
		return true;
	} catch (error) {
		logger.error('❌ Unable to connect to the database:', error);
		return false;
	}
};

module.exports = {
	sequelize,
	testConnection
};
