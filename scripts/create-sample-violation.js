/**
 * Script: create-sample-violation.js
 * Purpose: Quickly insert a demo violation that links an enforcer account to a citizen account
 * Usage: node scripts/create-sample-violation.js
 */

require("dotenv").config()

const { sequelize } = require("../config/database")
const { User } = require("../models")
const Violation = require("../models/Violation")

const ENFORCER_EMAIL = process.env.SAMPLE_ENFORCER_EMAIL || "enforcer1@laspinas.gov.ph"
const CITIZEN_EMAIL = process.env.SAMPLE_CITIZEN_EMAIL || "pedro.garcia@email.com"

const createSampleViolation = async () => {
  try {
    await sequelize.authenticate()
    console.log("✅ Database connection established.")

    const enforcer = await User.findOne({ where: { email: ENFORCER_EMAIL } })
    if (!enforcer) {
      throw new Error(`Enforcer with email ${ENFORCER_EMAIL} not found. Please ensure seed data exists.`)
    }

    const citizen = await User.findOne({ where: { email: CITIZEN_EMAIL } })
    if (!citizen) {
      throw new Error(`Citizen with email ${CITIZEN_EMAIL} not found. Please ensure seed data exists.`)
    }

    const now = new Date()
    const violationPayload = {
      plateNumber: "NAB-1234",
      vehicleType: "car",
      vehicleMake: "Toyota",
      vehicleModel: "Vios",
      vehicleColor: "White",
      vehicleYear: 2022,
      driverName: `${citizen.firstName} ${citizen.lastName}`,
      driverLicenseNumber: citizen.driverLicenseNumber || "DLN9876543",
      driverAddress: citizen.address || "Las Piñas City",
      driverPhone: citizen.phoneNumber,
      violationType: "illegal_parking",
      violationDescription: "Vehicle was parked in a no-parking zone blocking a pedestrian lane.",
      violationLocation: "Alabang-Zapote Road, Brgy. Pamplona",
      violationDate: now,
      violationTime: "10:30",
      baseFine: 2000,
      additionalPenalties: 500,
      demeritPoints: 2,
      status: "pending",
      enforcerId: enforcer.id,
      enforcerName: `${enforcer.firstName} ${enforcer.lastName}`,
      enforcerBadgeNumber: enforcer.enforcerBadgeNumber || "ENF-0001",
    }

    const violation = await Violation.create(violationPayload)

    console.log("✅ Sample violation created successfully!")
    console.table({
      ovrNumber: violation.ovrNumber,
      citationNumber: violation.citationNumber,
      driver: violation.driverName,
      plate: violation.plateNumber,
      totalFine: violation.totalFine,
      enforcer: violation.enforcerName,
    })
  } catch (error) {
    console.error("❌ Failed to create sample violation:", error.message)
    process.exitCode = 1
  } finally {
    await sequelize.close()
  }
}

createSampleViolation()


