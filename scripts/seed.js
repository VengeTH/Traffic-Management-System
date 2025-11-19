/**
 * Database Seeding Script
 * Populates the database with sample data for testing
 */

require("dotenv").config()
const { sequelize } = require("../config/database")
const { User, Violation, Payment } = require("../models")
const logger = require("../utils/logger")

const seedData = async () => {
  try {
    logger.info("Starting database seeding...")

    // * Test database connection
    await sequelize.authenticate()
    logger.info("Database connection established successfully.")

    // * Clear existing data
    await Payment.destroy({ where: {} })
    await Violation.destroy({ where: {} })
    await User.destroy({ where: {} })

    // * Create admin user
    const adminUser = await User.create({
      firstName: "System",
      lastName: "Administrator",
      email: process.env.ADMIN_EMAIL || "admin@laspinas.gov.ph",
      phoneNumber: "+639123456789",
      password: process.env.ADMIN_PASSWORD || "admin123456",
      role: "admin",
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      address: "Las Piñas City Hall, Las Piñas City",
      city: "Las Piñas",
      postalCode: "1740",
    })

    logger.info("Admin user created:", adminUser.email)

    // * Create enforcer users
    const enforcers = await User.bulkCreate(
      [
        {
          firstName: "Juan",
          lastName: "Dela Cruz",
          email: "enforcer1@laspinas.gov.ph",
          phoneNumber: "+639234567890",
          password: "enforcer123",
          role: "enforcer",
          isActive: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          address: "Las Piñas City Hall, Las Piñas City",
          city: "Las Piñas",
          postalCode: "1740",
        },
        {
          firstName: "Maria",
          lastName: "Santos",
          email: "enforcer2@laspinas.gov.ph",
          phoneNumber: "+639345678901",
          password: "enforcer123",
          role: "enforcer",
          isActive: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          address: "Las Piñas City Hall, Las Piñas City",
          city: "Las Piñas",
          postalCode: "1740",
        },
      ],
      { individualHooks: true }
    )

    logger.info("Enforcer users created:", enforcers.length)

    // * Create sample citizen users
    const citizens = await User.bulkCreate(
      [
        {
          firstName: "Pedro",
          lastName: "Garcia",
          email: "pedro.garcia@email.com",
          phoneNumber: "+639456789012",
          password: "citizen123",
          role: "citizen",
          isActive: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          driverLicenseNumber: "DL123456789",
          address: "123 Main Street, Las Piñas City",
          city: "Las Piñas",
          postalCode: "1740",
          dateOfBirth: "1985-03-15",
          licenseExpiryDate: "2025-03-15",
        },
        {
          firstName: "Ana",
          lastName: "Martinez",
          email: "ana.martinez@email.com",
          phoneNumber: "+639567890123",
          password: "Citizen123!",
          role: "citizen",
          isActive: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          driverLicenseNumber: "DL987654321",
          address: "456 Oak Avenue, Las Piñas City",
          city: "Las Piñas",
          postalCode: "1740",
          dateOfBirth: "1990-07-22",
          licenseExpiryDate: "2026-07-22",
        },
      ],
      { individualHooks: true }
    )

    logger.info("Citizen users created:", citizens.length)

    // * Create sample violations
    const violations = await Violation.bulkCreate(
      [
        {
          plateNumber: "ABC123",
          vehicleType: "car",
          vehicleMake: "Toyota",
          vehicleModel: "Vios",
          vehicleColor: "White",
          vehicleYear: 2020,
          driverName: "Pedro Garcia",
          driverLicenseNumber: "DL123456789",
          driverAddress: "123 Main Street, Las Piñas City",
          driverPhone: "+639456789012",
          violationType: "speeding",
          violationDescription:
            "Exceeding speed limit by 20 km/h in a 40 km/h zone",
          violationLocation: "Alabang-Zapote Road, Las Piñas City",
          violationDate: new Date("2024-01-15"),
          violationTime: "14:30:00",
          baseFine: 1000.0,
          additionalPenalties: 0.0,
          totalFine: 1000.0,
          demeritPoints: 3,
          status: "pending",
          enforcerId: enforcers[0].id,
          enforcerName: "Juan Dela Cruz",
          enforcerBadgeNumber: "ENF001",
        },
        {
          plateNumber: "XYZ789",
          vehicleType: "motorcycle",
          vehicleMake: "Honda",
          vehicleModel: "Click",
          vehicleColor: "Red",
          vehicleYear: 2022,
          driverName: "Ana Martinez",
          driverLicenseNumber: "DL987654321",
          driverAddress: "456 Oak Avenue, Las Piñas City",
          driverPhone: "+639567890123",
          violationType: "no_helmet",
          violationDescription: "Riding motorcycle without wearing helmet",
          violationLocation: "Quirino Avenue, Las Piñas City",
          violationDate: new Date("2024-01-20"),
          violationTime: "09:15:00",
          baseFine: 1500.0,
          additionalPenalties: 0.0,
          totalFine: 1500.0,
          demeritPoints: 2,
          status: "pending",
          enforcerId: enforcers[1].id,
          enforcerName: "Maria Santos",
          enforcerBadgeNumber: "ENF002",
        },
        {
          plateNumber: "DEF456",
          vehicleType: "car",
          vehicleMake: "Mitsubishi",
          vehicleModel: "Mirage",
          vehicleColor: "Blue",
          vehicleYear: 2021,
          driverName: "Pedro Garcia",
          driverLicenseNumber: "DL123456789",
          driverAddress: "123 Main Street, Las Piñas City",
          driverPhone: "+639456789012",
          violationType: "illegal_parking",
          violationDescription:
            "Parked in a no-parking zone for more than 1 hour",
          violationLocation: "Marcos Alvarez Avenue, Las Piñas City",
          violationDate: new Date("2024-01-25"),
          violationTime: "16:45:00",
          baseFine: 500.0,
          additionalPenalties: 0.0,
          totalFine: 500.0,
          demeritPoints: 1,
          status: "paid",
          enforcerId: enforcers[0].id,
          enforcerName: "Juan Dela Cruz",
          enforcerBadgeNumber: "ENF001",
        },
        {
          plateNumber: "GHI789",
          vehicleType: "truck",
          vehicleMake: "Isuzu",
          vehicleModel: "NHR",
          vehicleColor: "White",
          vehicleYear: 2019,
          driverName: "Carlos Rodriguez",
          driverLicenseNumber: "DL555666777",
          driverAddress: "789 Pine Street, Las Piñas City",
          driverPhone: "+639678901234",
          violationType: "overloading",
          violationDescription:
            "Truck carrying cargo exceeding maximum weight limit",
          violationLocation: "C-5 Extension, Las Piñas City",
          violationDate: new Date("2024-01-30"),
          violationTime: "11:20:00",
          baseFine: 2000.0,
          additionalPenalties: 500.0,
          totalFine: 2500.0,
          demeritPoints: 5,
          status: "pending",
          enforcerId: enforcers[1].id,
          enforcerName: "Maria Santos",
          enforcerBadgeNumber: "ENF002",
        },
      ],
      { individualHooks: true }
    )

    logger.info("Sample violations created:", violations.length)

    // * Create sample payments
    const payments = await Payment.bulkCreate(
      [
        {
          violationId: violations[2].id, // * Paid violation
          ovrNumber: violations[2].ovrNumber,
          citationNumber: violations[2].citationNumber,
          payerId: citizens[0].id,
          payerName: "Pedro Garcia",
          payerEmail: "pedro.garcia@email.com",
          payerPhone: "+639456789012",
          amount: 500.0,
          currency: "PHP",
          paymentMethod: "gcash",
          paymentProvider: "GCash",
          status: "completed",
          gatewayTransactionId: "GCASH_SAMPLE_001",
          gatewayReference: "GCASH_REF_001",
          gatewayResponse: { status: "paid" },
          processingFee: 0.0,
          totalAmount: 500.0,
          initiatedAt: new Date("2024-01-26 10:00:00"),
          processedAt: new Date("2024-01-26 10:01:00"),
          completedAt: new Date("2024-01-26 10:02:00"),
          ipAddress: "192.168.1.100",
          userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      ],
      { individualHooks: true }
    )

    logger.info("Sample payments created:", payments.length)

    // * Update the paid violation status
    await violations[2].update({ status: "paid" })

    logger.info("Database seeding completed successfully!")
    logger.info("Sample data created:")
    logger.info(`- ${enforcers.length} enforcer users`)
    logger.info(`- ${citizens.length} citizen users`)
    logger.info(`- ${violations.length} violations`)
    logger.info(`- ${payments.length} payments`)
  } catch (error) {
    logger.error("Seeding failed:", error)
    process.exit(1)
  } finally {
    await sequelize.close()
  }
}

// * Run seeding if this file is executed directly
if (require.main === module) {
  seedData()
}

module.exports = { seedData }
