# E-VioPay - Las Piñas Traffic Management System

## Project Overview

**E-VioPay** is a comprehensive, full-stack web-based traffic violation management and payment system developed for the City of Las Piñas, Philippines. This enterprise-grade application streamlines the entire traffic violation lifecycle—from citation issuance by traffic enforcers to online payment processing and digital receipt generation for citizens.

## Key Features

### 🚦 Core Functionality

**Multi-Role System**
- **Citizen Portal**: Search violations, view violation history, make online payments, receive digital receipts
- **Enforcer Portal**: Issue traffic citations, manage issued violations, track enforcement activities
- **Admin Dashboard**: Complete system management, user administration, violation oversight, comprehensive reporting and analytics

**Violation Management**
- Search violations by OVR number, plate number, or driver license number
- Real-time violation status tracking (pending, paid, overdue, disputed)
- Automatic fine calculation with penalty structures
- Violation history and detailed records
- QR code-enabled digital receipts

**Payment Processing**
- Multi-gateway integration: PayMongo, GCash, Maya, DragonPay, Debit/Credit Cards
- Secure payment processing with transaction verification
- Automatic receipt generation (PDF with QR codes)
- Payment history tracking
- Email and SMS payment confirmations

**Notification System**
- SMS notifications via Twilio (violation notices, payment reminders, overdue alerts)
- Email notifications via Nodemailer (receipts, confirmations, reminders)
- Automated payment reminder system
- Overdue violation alerts

### 🔐 Security Features

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Password hashing with bcryptjs
- CSRF protection
- Rate limiting and request throttling
- Input sanitization and validation
- SQL injection protection via Sequelize ORM
- XSS protection
- Helmet.js security headers
- HTTPS enforcement
- Request ID tracking for security incident tracing

### 🎨 User Interface

**Modern Design System**
- Green-themed UI reflecting Las Piñas City's natural beauty
- Glassmorphism effects and gradient cards
- Responsive design (mobile-first approach)
- Dark mode support
- Smooth animations and transitions
- WCAG AA/AAA accessibility compliance
- TailwindCSS-based component library

**User Experience**
- Intuitive navigation with sidebar and navbar
- Loading states and error boundaries
- Form validation with real-time feedback
- Toast notifications for user actions
- Skeleton screens for better perceived performance
- Optimized for all screen sizes

## Technology Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: PostgreSQL (primary), SQLite (development)
- **ORM**: Sequelize
- **Authentication**: JWT (jsonwebtoken)
- **Security**: Helmet, CORS, express-rate-limit, express-validator
- **Email**: Nodemailer
- **SMS**: Twilio
- **QR Codes**: qrcode
- **PDF Generation**: PDFKit
- **Logging**: Winston
- **File Upload**: Multer

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **State Management**: React Context API
- **Forms**: React Hook Form with Yup validation
- **HTTP Client**: Axios
- **UI Components**: Headless UI, Heroicons, Lucide React
- **Notifications**: React Hot Toast
- **Charts**: Recharts
- **Build Tool**: Create React App

### Payment Gateways
- PayMongo (primary)
- GCash
- Maya
- DragonPay
- Debit/Credit Cards

### DevOps & Infrastructure
- Environment-based configuration
- Database migrations
- Seed scripts for sample data
- Health check endpoints
- Comprehensive error handling
- Request logging with Morgan
- Graceful shutdown handling

## Architecture Highlights

### Backend Architecture
- RESTful API design with versioning (/api/v1/)
- Middleware-based request processing pipeline
- Service layer pattern for business logic
- Repository pattern for data access
- Comprehensive error handling middleware
- Request validation and sanitization
- Rate limiting per endpoint type

### Frontend Architecture
- Component-based architecture
- Context API for global state (Auth, Payment)
- Protected routes with role-based access
- Error boundaries for fault tolerance
- Custom hooks for reusable logic
- Type-safe with TypeScript
- Performance optimizations (lazy loading, memoization)

### Database Schema
- **Users**: Authentication, profiles, roles (citizen, enforcer, admin)
- **Violations**: Traffic citations, vehicle/driver info, fine calculations
- **Payments**: Transaction records, gateway integration, receipts
- **Notifications**: System notifications and user alerts

## Key Achievements

✅ **Full-Stack Development**: Complete end-to-end application from database to UI
✅ **Payment Integration**: Multiple payment gateway integrations with fallback support
✅ **Security First**: Comprehensive security measures following industry best practices
✅ **Scalable Architecture**: Designed to handle growth with proper separation of concerns
✅ **User-Centric Design**: Modern, accessible UI with excellent user experience
✅ **Production Ready**: Error handling, logging, monitoring, and deployment configurations
✅ **Documentation**: Comprehensive documentation including setup guides, API docs, and design system

## Technical Challenges Solved

1. **Multi-Gateway Payment Processing**: Implemented unified payment interface supporting multiple gateways with consistent error handling
2. **Role-Based Access Control**: Complex permission system supporting three distinct user roles with different capabilities
3. **Real-Time Notifications**: Integrated SMS and email notification system with template management
4. **QR Code Receipts**: Generated secure, verifiable digital receipts with embedded QR codes
5. **Security Hardening**: Implemented multiple layers of security including rate limiting, CSRF protection, and input sanitization
6. **Responsive Design**: Created mobile-first, fully responsive interface that works seamlessly across all devices

## Project Statistics

- **Backend Routes**: 50+ API endpoints
- **Frontend Pages**: 20+ pages/components
- **Database Models**: 4 core models with relationships
- **Security Middleware**: 10+ security layers
- **Payment Gateways**: 4 integrated gateways
- **Lines of Code**: 10,000+ lines
- **Development Time**: Full-stack development cycle

## Deployment

- Frontend deployed to GitHub Pages
- Backend API ready for cloud deployment (Heroku, AWS, DigitalOcean)
- Environment-based configuration
- Database migration scripts
- Health check endpoints for monitoring

## Future Enhancements

- Progressive Web App (PWA) support
- AI-powered violation pattern analysis
- Mobile app development
- Multi-language support
- Advanced analytics dashboard
- Integration with government systems
- Dispute management system

## Portfolio Description (Short Version)

**E-VioPay** is a full-stack traffic violation management system built for Las Piñas City, Philippines. The application features a React/TypeScript frontend with a Node.js/Express backend, supporting three user roles (citizens, enforcers, admins). Key features include violation search and management, multi-gateway payment processing (PayMongo, GCash, Maya), automated SMS/email notifications, QR code receipt generation, and comprehensive admin dashboards. The system implements enterprise-grade security with JWT authentication, rate limiting, CSRF protection, and follows modern web development best practices. Built with PostgreSQL, Sequelize ORM, and TailwindCSS, the application is production-ready with proper error handling, logging, and deployment configurations.

## Skills Demonstrated

- Full-Stack Web Development (React, Node.js, Express)
- TypeScript & JavaScript
- RESTful API Design
- Database Design & Management (PostgreSQL, SQLite)
- Payment Gateway Integration
- Authentication & Authorization (JWT, RBAC)
- Security Implementation (CSRF, XSS, SQL Injection protection)
- Responsive UI/UX Design
- Third-Party API Integration (Twilio, Nodemailer)
- File Processing (PDF generation, QR codes)
- Error Handling & Logging
- Testing & Debugging
- Version Control (Git)
- Documentation

---

**Project Type**: Full-Stack Web Application  
**Industry**: Government/Public Sector, Traffic Management  
**Technologies**: React, TypeScript, Node.js, Express, PostgreSQL, TailwindCSS  
**Status**: Production Ready  
**Live Demo**: Available on GitHub Pages  
**Repository**: Private/Public (as applicable)

