# Las Piñas Traffic Online Payment System - Setup Guide

## 🚀 Quick Start Guide

This guide will walk you through setting up the Las Piñas Traffic Online Payment System on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download here](https://www.postgresql.org/download/)
- **Git** - [Download here](https://git-scm.com/downloads)

### Optional Software

- **Redis** (for rate limiting and caching) - [Download here](https://redis.io/download)
- **Postman** (for API testing) - [Download here](https://www.postman.com/downloads/)

## 🛠️ Installation Steps

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd las-pinas-traffic-payment-system

# Or if you're starting fresh
mkdir las-pinas-traffic-payment-system
cd las-pinas-traffic-payment-system
```

### Step 2: Install Dependencies

```bash
# Install backend dependencies
npm install

# Install all dependencies (including frontend when created)
npm run install:all
```

### Step 3: Set Up PostgreSQL Database

#### Option A: Using PostgreSQL Command Line

```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# Create database
CREATE DATABASE las_pinas_traffic_db;

# Create user (optional, for security)
CREATE USER traffic_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE las_pinas_traffic_db TO traffic_user;

# Exit PostgreSQL
\q
```

#### Option B: Using pgAdmin (GUI)

1. Open pgAdmin
2. Right-click on "Databases"
3. Select "Create" → "Database"
4. Name it `las_pinas_traffic_db`
5. Click "Save"

### Step 4: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your configuration
notepad .env  # Windows
# or
nano .env     # Linux/Mac
```

#### Required Environment Variables

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=las_pinas_traffic_db
DB_USER=postgres
DB_PASSWORD=your_db_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_refresh_token_secret_here
JWT_REFRESH_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Email Configuration (for receipts and notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=traffic@laspinas.gov.ph

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Payment Gateway Configuration
PAYMONGO_SECRET_KEY=pk_test_your_paymongo_secret_key
PAYMONGO_PUBLIC_KEY=pk_test_your_paymongo_public_key

# Redis Configuration (optional, for rate limiting)
REDIS_URL=redis://localhost:6379
```

### Step 5: Set Up Database

```bash
# Run database migrations
npm run migrate

# Seed the database with sample data
npm run seed
```

### Step 6: Start the Development Server

```bash
# Start the backend server
npm run dev
```

The server will start on `http://localhost:5000`

## 🧪 Testing the Setup

### 1. Health Check

Visit `http://localhost:5000/health` in your browser or use curl:

```bash
curl http://localhost:5000/health
```

Expected response:

```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

### 2. Test API Endpoints

#### Register a New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+639123456789",
    "password": "Password123!"
  }'
```

#### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "Password123!"
  }'
```

#### Search for Violations

```bash
curl -X GET "http://localhost:5000/api/violations/search?ovrNumber=OVR2024001"
```

### 3. Test Admin Access

Use the default admin credentials created during seeding:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@laspinas.gov.ph",
    "password": "admin123456"
  }'
```

## 📁 Project Structure

```
las-pinas-traffic-payment-system/
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   ├── auth.js              # Authentication middleware
│   ├── errorHandler.js      # Error handling
│   └── notFound.js          # 404 handler
├── models/
│   ├── User.js              # User model
│   ├── Violation.js         # Violation model
│   ├── Payment.js           # Payment model
│   └── index.js             # Model associations
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── violations.js        # Violation management
│   ├── payments.js          # Payment processing
│   ├── admin.js             # Admin dashboard
│   └── users.js             # User operations
├── scripts/
│   ├── migrate.js           # Database migration
│   └── seed.js              # Sample data seeding
├── utils/
│   ├── logger.js            # Logging utility
│   ├── email.js             # Email sending
│   ├── sms.js               # SMS sending
│   └── qrcode.js            # QR code generation
├── uploads/                 # File uploads
├── logs/                    # Application logs
├── .env.example             # Environment variables template
├── package.json             # Dependencies and scripts
├── server.js                # Main application file
└── README.md                # Project documentation
```

## 🔧 Configuration Options

### Email Configuration

For Gmail, you'll need to:

1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `SMTP_PASS`

### SMS Configuration (Twilio)

1. Sign up for a Twilio account
2. Get your Account SID and Auth Token
3. Get a phone number for sending SMS

### Payment Gateway Configuration

#### PayMongo (Recommended for Philippines)

1. Sign up at [PayMongo](https://paymongo.com/)
2. Get your API keys from the dashboard
3. Use test keys for development

#### Other Gateways

- GCash: Contact GCash for merchant integration
- Maya: Contact Maya for merchant integration
- DragonPay: Contact DragonPay for merchant integration

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Error

**Error**: `ECONNREFUSED` or `password authentication failed`

**Solution**:

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgresql  # Mac
# On Windows, check Services app

# Verify connection details in .env
# Test connection manually
psql -h localhost -U postgres -d las_pinas_traffic_db
```

#### 2. Port Already in Use

**Error**: `EADDRINUSE`

**Solution**:

```bash
# Find process using port 5000
netstat -ano | findstr :5000  # Windows
lsof -i :5000  # Mac/Linux

# Kill the process or change PORT in .env
```

#### 3. Module Not Found

**Error**: `Cannot find module`

**Solution**:

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 4. JWT Secret Error

**Error**: `jwt malformed` or `invalid signature`

**Solution**:

```bash
# Generate a new JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Update JWT_SECRET in .env
```

### Logs and Debugging

Check the logs directory for detailed error information:

```bash
# View error logs
tail -f logs/error.log

# View all logs
tail -f logs/combined.log
```

## 🔒 Security Considerations

### Production Deployment

1. **Change Default Passwords**: Update admin credentials
2. **Use Strong JWT Secrets**: Generate cryptographically secure secrets
3. **Enable HTTPS**: Use SSL/TLS certificates
4. **Database Security**: Use dedicated database user with minimal privileges
5. **Environment Variables**: Never commit `.env` files to version control
6. **Rate Limiting**: Configure appropriate rate limits for production
7. **Logging**: Set up proper log rotation and monitoring

### Security Checklist

- [ ] Change default admin credentials
- [ ] Use strong JWT secrets
- [ ] Configure HTTPS
- [ ] Set up database user with minimal privileges
- [ ] Enable rate limiting
- [ ] Configure proper CORS settings
- [ ] Set up log monitoring
- [ ] Regular security updates

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs in the `logs/` directory
3. Check the API documentation in `README.md`
4. Verify your environment configuration

## 🎯 Next Steps

After successful setup:

1. **Frontend Development**: Create the React frontend application
2. **Payment Integration**: Configure real payment gateway credentials
3. **Email/SMS Setup**: Configure real email and SMS services
4. **Testing**: Write comprehensive tests
5. **Deployment**: Deploy to production environment

## 📚 Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT.io](https://jwt.io/) - JWT debugging and validation
