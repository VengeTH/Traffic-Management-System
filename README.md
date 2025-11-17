# Las Piñas Traffic Online Payment System

A comprehensive web-based traffic violation payment system for the City of Las Piñas, Philippines. This system enables citizens to search for violations, make online payments, and receive digital receipts, while providing administrators with tools to manage violations, monitor payments, and generate reports.

## 🚀 Features

### Core Features (MVP)
- **Violation Lookup**: Search violations by OVR number, plate number, or driver license number
- **Online Payment**: Integrated payment gateways (GCash, Maya, PayMongo, DragonPay, Debit/Credit Cards)
- **Digital Receipts**: QR code-enabled receipts sent via email/SMS
- **Admin Dashboard**: Complete management interface for LGU administrators
- **User Authentication**: Secure JWT-based authentication with 2FA support

### Phase 2 Features
- **Notification System**: SMS/email reminders for pending fines
- **Violation History**: User dashboard for violation history
- **Dispute Submission**: Upload evidence and submit disputes

### Phase 3 Features (Future)
- **Traffic Education**: Resources and penalty guides
- **QR Code Integration**: Physical tickets with QR codes
- **Mobile PWA**: Progressive Web App for mobile devices
- **AI Analytics**: Hotspot analysis and violation pattern detection

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Primary database
- **Sequelize** - ORM for database management
- **JWT** - Authentication and authorization
- **bcryptjs** - Password hashing
- **Nodemailer** - Email notifications
- **Twilio** - SMS notifications
- **QRCode** - QR code generation
- **PDFKit** - PDF receipt generation

### Frontend (Coming Soon)
- **React.js** - Frontend framework
- **TailwindCSS** - Styling framework
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **Chart.js** - Data visualization

### Payment Gateways
- **PayMongo** - Primary payment processor
- **GCash** - Mobile wallet integration
- **Maya** - Digital wallet integration
- **DragonPay** - Alternative payment processor

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **PostgreSQL** (v12.0 or higher)
- **Redis** (v6.0 or higher) - Optional, for rate limiting

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd las-pinas-traffic-payment-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the environment template and configure your settings:

```bash
cp env.example .env
```

Edit the `.env` file with your configuration:

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

# Server Configuration
PORT=5000
NODE_ENV=development

# Email Configuration
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

# Admin Default Credentials
ADMIN_EMAIL=admin@laspinas.gov.ph
ADMIN_PASSWORD=admin123456
```

### 4. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE las_pinas_traffic_db;
```

### 5. Run Database Migrations

```bash
npm run migrate
```

### 6. Seed Sample Data (Optional)

```bash
npm run seed
```

### 7. Start the Application

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The application will be available at `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@email.com",
  "phoneNumber": "+639123456789",
  "password": "SecurePass123!",
  "driverLicenseNumber": "DL123456789"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@email.com",
  "password": "SecurePass123!"
}
```

### Violation Endpoints

#### Search Violations
```http
GET /api/violations/search?ovrNumber=OVR20240115001
GET /api/violations/search?plateNumber=ABC123
GET /api/violations/search?driverLicenseNumber=DL123456789
```

#### Get Violation Details
```http
GET /api/violations/:id
```

### Payment Endpoints

#### Initiate Payment
```http
POST /api/payments/initiate
Content-Type: application/json

{
  "ovrNumber": "OVR20240115001",
  "paymentMethod": "gcash",
  "payerName": "John Doe",
  "payerEmail": "john.doe@email.com",
  "payerPhone": "+639123456789"
}
```

#### Confirm Payment
```http
POST /api/payments/confirm
Content-Type: application/json

{
  "paymentId": "PAY20240126001",
  "gatewayTransactionId": "GCASH_123456789"
}
```

### Admin Endpoints

#### Get Dashboard Statistics
```http
GET /api/admin/dashboard
Authorization: Bearer <admin_token>
```

#### Get All Users
```http
GET /api/admin/users?page=1&limit=10
Authorization: Bearer <admin_token>
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Cross-origin resource sharing security
- **Helmet.js**: Security headers middleware
- **SQL Injection Protection**: Sequelize ORM with parameterized queries
- **XSS Protection**: Input sanitization and output encoding

## 📊 Database Schema

### Users Table
- User authentication and profile information
- Role-based access control (citizen, enforcer, admin)
- Two-factor authentication support

### Violations Table
- Traffic violation records
- Vehicle and driver information
- Fine calculation and status tracking

### Payments Table
- Payment transaction records
- Gateway integration data
- Receipt generation and QR codes

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

## 📦 Deployment

### Environment Variables
Ensure all environment variables are properly configured for production:

```env
NODE_ENV=production
PORT=5000
DB_HOST=your_production_db_host
DB_PASSWORD=your_production_db_password
JWT_SECRET=your_production_jwt_secret
```

### Database Migration
```bash
npm run migrate
```

### Start Production Server
```bash
npm start
```

### Runtime API URL Override (GitHub Pages Hotfix)

If you already deployed the frontend to GitHub Pages and forgot to rebuild with the correct `REACT_APP_API_URL`, you can temporarily point the app to a different backend without rebuilding:

1. Open your deployed site with the desired API URL appended as a query parameter:
   ```
   https://vengeth.github.io/Traffic-Management-System/?apiBaseUrl=https://your-api-domain.com
   ```
2. The app validates the URL (HTTPS is required unless you are targeting `localhost`) and stores it securely in `localStorage` using the `trafficApiBaseUrlOverride` key.
3. Subsequent visits automatically use the stored override. To clear it, run the following in the browser console:
   ```js
   localStorage.removeItem("trafficApiBaseUrlOverride");
   window.location.reload();
   ```

> **Note:** This override is intended as an emergency fix. Always rebuild with the correct `REACT_APP_API_URL` for long-term deployments.

## 🔧 Configuration

### Payment Gateway Setup

#### PayMongo
1. Create a PayMongo account
2. Get your API keys from the dashboard
3. Configure webhook endpoints
4. Update environment variables

#### GCash
1. Register as a GCash merchant
2. Configure API credentials
3. Set up webhook notifications

### Email Configuration
1. Configure SMTP settings in `.env`
2. Set up email templates
3. Test email delivery

### SMS Configuration
1. Create a Twilio account
2. Get your Account SID and Auth Token
3. Configure phone number
4. Test SMS delivery

## 📝 API Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- **Email**: support@laspinas.gov.ph
- **Phone**: +63 2 1234 5678
- **Documentation**: [API Documentation](docs/api.md)

## 🗺️ Roadmap

### Phase 1 (Current)
- [x] Backend API development
- [x] Database schema design
- [x] Authentication system
- [x] Payment gateway integration
- [x] Email/SMS notifications

### Phase 2 (Next)
- [ ] Frontend React application
- [ ] Admin dashboard
- [ ] Mobile responsive design
- [ ] Advanced reporting

### Phase 3 (Future)
- [ ] Mobile PWA
- [ ] AI-powered analytics
- [ ] Integration with government systems
- [ ] Multi-language support

## 📊 System Requirements

### Minimum Requirements
- **Node.js**: v18.0.0+
- **PostgreSQL**: v12.0+
- **RAM**: 2GB+
- **Storage**: 10GB+

### Recommended Requirements
- **Node.js**: v20.0.0+
- **PostgreSQL**: v15.0+
- **Redis**: v7.0+
- **RAM**: 4GB+
- **Storage**: 50GB+

## 🔄 Updates and Maintenance

### Regular Maintenance Tasks
1. Database backups
2. Log rotation
3. Security updates
4. Performance monitoring
5. Payment gateway reconciliation

### Monitoring
- Application health checks
- Database performance monitoring
- Payment transaction monitoring
- Error tracking and alerting

---

**Las Piñas Traffic Online Payment System** - Streamlining traffic violation management for the City of Las Piñas.

---

**Developed by [The Heedful](https://vengeth.github.io/The-Heedful)**



