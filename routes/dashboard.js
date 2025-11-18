/**
 * Dashboard Routes
 * Provide consolidated statistics for authenticated users
 */

const express = require("express");
const { Op } = require("sequelize");
const { auth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");
const { User, Violation, Payment } = require("../models");

const router = express.Router();

// * Ensure all routes require authentication
router.use(auth);

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics tailored to the current user's role
 * @access  Private
 */
router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    // * Base response shared across all roles
    const payload = {
      role: req.user.role,
      generatedAt: new Date().toISOString(),
    };

    if (req.user.canPerformAdminAction()) {
      // * Admin level aggregates
      const [
        totalUsers,
        activeUsers,
        totalViolations,
        pendingViolations,
        paidViolations,
        disputedViolations,
        totalPayments,
        completedPayments,
        totalRevenue,
        recentViolations,
        recentPayments,
      ] = await Promise.all([
        User.count(),
        User.count({ where: { isActive: true } }),
        Violation.count(),
        Violation.count({ where: { status: "pending" } }),
        Violation.count({ where: { status: "paid" } }),
        Violation.count({ where: { status: "disputed" } }),
        Payment.count(),
        Payment.count({ where: { status: "completed" } }),
        Payment.sum("totalAmount", { where: { status: "completed" } }),
        Violation.findAll({
          attributes: ["id", "ovrNumber", "violationType", "status", "totalFine", "createdAt"],
          order: [["createdAt", "DESC"]],
          limit: 5,
        }),
        Payment.findAll({
          attributes: ["id", "paymentId", "status", "totalAmount", "paymentMethod", "createdAt"],
          order: [["createdAt", "DESC"]],
          limit: 5,
        }),
      ]);

      payload.admin = {
        users: {
          total: totalUsers,
          active: activeUsers,
        },
        violations: {
          total: totalViolations,
          pending: pendingViolations,
          paid: paidViolations,
          disputed: disputedViolations,
        },
        payments: {
          total: totalPayments,
          completed: completedPayments,
          totalAmount: Number(totalRevenue || 0),
        },
        recentViolations: recentViolations.map((v) => v.toJSON()),
        recentPayments: recentPayments.map((p) => p.toJSON()),
      };
    } else if (req.user.canPerformEnforcerAction()) {
      // * Enforcer specific metrics
      const badgeNumber =
        req.user.enforcerBadgeNumber || `ENF-${req.user.id.substring(0, 8).toUpperCase()}`;

      const enforcerFilter = {
        [Op.or]: [{ enforcerId: req.user.id }, { enforcerBadgeNumber: badgeNumber }],
      };

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        totalIssued,
        pendingIssued,
        paidIssued,
        todaysIssued,
        recentIssued,
      ] = await Promise.all([
        Violation.count({ where: enforcerFilter }),
        Violation.count({ where: { ...enforcerFilter, status: "pending" } }),
        Violation.count({ where: { ...enforcerFilter, status: "paid" } }),
        Violation.count({
          where: {
            ...enforcerFilter,
            createdAt: {
              [Op.gte]: today,
            },
          },
        }),
        Violation.findAll({
          where: enforcerFilter,
          attributes: [
            "id",
            "ovrNumber",
            "violationType",
            "status",
            "totalFine",
            "violationLocation",
            "createdAt",
          ],
          order: [["createdAt", "DESC"]],
          limit: 5,
        }),
      ]);

      payload.enforcer = {
        issued: {
          total: totalIssued,
          pending: pendingIssued,
          paid: paidIssued,
          today: todaysIssued,
        },
        recentViolations: recentIssued.map((v) => v.toJSON()),
      };
    } else {
      // * Citizen / driver dashboard metrics
      const violationFilter = req.user.driverLicenseNumber
        ? { driverLicenseNumber: req.user.driverLicenseNumber }
        : { driverPhone: req.user.phoneNumber };

      const [
        totalViolations,
        pendingViolations,
        paidViolations,
        overdueViolations,
        totalPayments,
        completedPayments,
        totalAmountPaid,
        recentViolations,
        recentPayments,
      ] = await Promise.all([
        Violation.count({ where: violationFilter }),
        Violation.count({ where: { ...violationFilter, status: "pending" } }),
        Violation.count({ where: { ...violationFilter, status: "paid" } }),
        Violation.count({
          where: {
            ...violationFilter,
            status: "pending",
            paymentDeadline: {
              [Op.lt]: new Date(),
            },
          },
        }),
        Payment.count({ where: { payerId: req.user.id } }),
        Payment.count({ where: { payerId: req.user.id, status: "completed" } }),
        Payment.sum("totalAmount", { where: { payerId: req.user.id, status: "completed" } }),
        Violation.findAll({
          where: violationFilter,
          attributes: ["id", "ovrNumber", "violationType", "status", "totalFine", "violationDate"],
          order: [["violationDate", "DESC"]],
          limit: 5,
        }),
        Payment.findAll({
          where: { payerId: req.user.id },
          attributes: ["id", "paymentId", "status", "totalAmount", "paymentMethod", "createdAt"],
          order: [["createdAt", "DESC"]],
          limit: 5,
        }),
      ]);

      payload.citizen = {
        violations: {
          total: totalViolations,
          pending: pendingViolations,
          paid: paidViolations,
          overdue: overdueViolations,
        },
        payments: {
          total: totalPayments,
          completed: completedPayments,
          totalAmount: Number(totalAmountPaid || 0),
        },
        recentViolations: recentViolations.map((v) => v.toJSON()),
        recentPayments: recentPayments.map((p) => p.toJSON()),
      };
    }

    res.json({
      success: true,
      message: "Dashboard statistics retrieved successfully",
      data: payload,
    });
  })
);

module.exports = router;


