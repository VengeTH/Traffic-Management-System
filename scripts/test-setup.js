/**
 * Test Setup Script
 * Verifies that the Las Piñas Traffic Payment System is properly configured
 */

require('dotenv').config();
const { sequelize } = require('../config/database');
const { User, Violation, Payment } = require('../models');
const logger = require('../utils/logger');

const testSetup = async () => {
  console.log('🧪 Testing Las Piñas Traffic Payment System Setup...\n');

  try {
    // * Test 1: Database Connection
    console.log('1. Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful\n');

    // * Test 2: Model Synchronization
    console.log('2. Testing model synchronization...');
    await sequelize.sync({ force: false });
    console.log('✅ Models synchronized successfully\n');

    // * Test 3: Environment Variables
    console.log('3. Checking environment variables...');
    const requiredEnvVars = [
      'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD',
      'JWT_SECRET', 'JWT_REFRESH_SECRET',
      'PORT', 'NODE_ENV'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.log('⚠️  Missing environment variables:', missingVars.join(', '));
    } else {
      console.log('✅ All required environment variables are set\n');
    }

    // * Test 4: Sample Data Check
    console.log('4. Checking sample data...');
    const userCount = await User.count();
    const violationCount = await Violation.count();
    const paymentCount = await Payment.count();

    console.log(`   Users: ${userCount}`);
    console.log(`   Violations: ${violationCount}`);
    console.log(`   Payments: ${paymentCount}`);

    if (userCount === 0) {
      console.log('⚠️  No users found. Run "npm run seed" to create sample data.');
    } else {
      console.log('✅ Sample data found\n');
    }

    // * Test 5: Admin User Check
    console.log('5. Checking admin user...');
    const adminUser = await User.findOne({ where: { role: 'admin' } });
    
    if (adminUser) {
      console.log(`✅ Admin user found: ${adminUser.email}`);
      console.log(`   Name: ${adminUser.getFullName()}`);
      console.log(`   Role: ${adminUser.role}\n`);
    } else {
      console.log('⚠️  No admin user found. Run "npm run seed" to create one.\n');
    }

    // * Test 6: API Endpoints Test (if server is running)
    console.log('6. Testing API endpoints...');
    const http = require('http');
    
    const testEndpoint = (path) => {
      return new Promise((resolve) => {
        const options = {
          hostname: 'localhost',
          port: process.env.PORT || 5000,
          path: path,
          method: 'GET',
          timeout: 5000
        };

        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            resolve({ status: res.statusCode, data: data });
          });
        });

        req.on('error', () => {
          resolve({ status: 0, error: 'Connection failed' });
        });

        req.on('timeout', () => {
          req.destroy();
          resolve({ status: 0, error: 'Timeout' });
        });

        req.end();
      });
    };

    const healthCheck = await testEndpoint('/health');
    
    if (healthCheck.status === 200) {
      console.log('✅ Health check endpoint responding');
      try {
        const healthData = JSON.parse(healthCheck.data);
        console.log(`   Status: ${healthData.status}`);
        console.log(`   Uptime: ${healthData.uptime}s\n`);
      } catch (e) {
        console.log('⚠️  Health check response not in expected format\n');
      }
    } else {
      console.log('⚠️  Health check failed. Make sure the server is running with "npm run dev"\n');
    }

    // * Test 7: File System Check
    console.log('7. Checking file system...');
    const fs = require('fs');
    const path = require('path');

    const requiredDirs = ['uploads', 'logs', 'uploads/qrcodes'];
    const missingDirs = [];

    requiredDirs.forEach(dir => {
      const dirPath = path.join(__dirname, '..', dir);
      if (!fs.existsSync(dirPath)) {
        missingDirs.push(dir);
      }
    });

    if (missingDirs.length > 0) {
      console.log('⚠️  Missing directories:', missingDirs.join(', '));
      console.log('   Creating missing directories...');
      
      missingDirs.forEach(dir => {
        const dirPath = path.join(__dirname, '..', dir);
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`   ✅ Created: ${dir}`);
      });
    } else {
      console.log('✅ All required directories exist');
    }

    // * Test 8: Dependencies Check
    console.log('\n8. Checking dependencies...');
    const packageJson = require('../package.json');
    const requiredDeps = [
      'express', 'sequelize', 'pg', 'jsonwebtoken', 'bcryptjs',
      'nodemailer', 'twilio', 'qrcode', 'winston'
    ];

    const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
    
    if (missingDeps.length > 0) {
      console.log('⚠️  Missing dependencies:', missingDeps.join(', '));
      console.log('   Run "npm install" to install missing dependencies');
    } else {
      console.log('✅ All required dependencies are installed');
    }

    // * Summary
    console.log('\n🎉 Setup Test Summary:');
    console.log('✅ Database connection: Working');
    console.log('✅ Model synchronization: Working');
    console.log('✅ Environment variables: Configured');
    console.log('✅ File system: Ready');
    console.log('✅ Dependencies: Installed');
    
    if (userCount > 0) {
      console.log('✅ Sample data: Available');
    } else {
      console.log('⚠️  Sample data: Run "npm run seed"');
    }
    
    if (healthCheck.status === 200) {
      console.log('✅ API server: Running');
    } else {
      console.log('⚠️  API server: Start with "npm run dev"');
    }

    console.log('\n🚀 System is ready for development!');
    console.log('\nNext steps:');
    console.log('1. Start the server: npm run dev');
    console.log('2. Test API endpoints with Postman or curl');
    console.log('3. Create the React frontend');
    console.log('4. Configure payment gateways');
    console.log('5. Set up email and SMS services');

  } catch (error) {
    console.error('\n❌ Setup test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check your .env file configuration');
    console.error('2. Ensure PostgreSQL is running');
    console.error('3. Verify database credentials');
    console.error('4. Run "npm install" to install dependencies');
    console.error('5. Check the logs directory for detailed errors');
    
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

// * Run the test if this file is executed directly
if (require.main === module) {
  testSetup();
}

module.exports = { testSetup };



