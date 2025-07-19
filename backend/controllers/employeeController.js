import Leave from "../models/Leave.js";
import LeaveBalance from "../models/LeaveBalance.js";
import {
  checkLeaveOverlap,
  deductLeaveBalance,
  restoreLeaveBalance,
} from "../services/leaveService.js";
import createAuditLog from "../services/userService.js";
import { Op } from "sequelize";

const applyLeave = async (req, res) => {
  try {
    const { fromDate, toDate, type, reason } = req.body;
    const userId = req.user.id;
    const year = new Date(fromDate).getFullYear();

    const overlappingLeave = await checkLeaveOverlap(userId, fromDate, toDate);
    if (overlappingLeave) {
      return res.status(400).json({
        error: "Overlapping leave exists",
        conflictingLeaveId: overlappingLeave.id,
        existingDates: `${overlappingLeave.fromDate} to ${overlappingLeave.toDate}`,
      });
    }

    const newBalance = await deductLeaveBalance(userId, type, year);

    const leave = await Leave.create({
      userId,
      fromDate,
      toDate,
      type,
      reason,
      status: "pending",
    });

    await createAuditLog({
      actionBy: userId,
      actionType: "leave_application",
      actionTarget: `leave_${leave.id}`,
      details: `Applied ${type} leave (${fromDate} to ${toDate})`,
    });

    res.status(201).json({
      success: true,
      data: leave,
      remainingBalance: newBalance,
    });
  } catch (error) {
    console.error("Leave application error:", error.stack || error);
    res.status(500).json({
      error: "Failed to process leave application",
      details: error.message,
    });
  }
};

const cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!leave) {
      return res.status(404).json({
        error: "Leave not found or not owned by user",
      });
    }

    if (leave.status !== "pending") {
      return res.status(400).json({
        error: "Only pending leaves can be cancelled",
        currentStatus: leave.status,
      });
    }

    await leave.destroy();

    await createAuditLog({
      actionBy: req.user.id,
      actionType: "leave_cancellation",
      actionTarget: `leave_${leave.id}`,
      details: `Cancelled ${leave.type} leave`,
    });

    res.json({
      success: true,
      message: "Leave cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel leave error:", error.stack || error);
    res.status(500).json({
      error: "Failed to cancel leave",
      details: error.message,
    });
  }
};

const getLeaveBalances = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const balances = await LeaveBalance.findAll({
      where: {
        userId: req.user.id,
        year: {
          [Op.between]: [currentYear - 1, currentYear + 1],
        },
      },
      attributes: ["type", "year", "balance"],
      order: [
        ["year", "DESC"],
        ["type", "ASC"],
      ],
    });

    if (!balances || balances.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No leave balances found",
      });
    }

    const structuredBalances = balances.reduce((acc, balance) => {
      const year = balance.year;
      if (!acc[year]) acc[year] = {};
      acc[year][balance.type] = balance.balance;
      return acc;
    }, {});

    res.json({
      success: true,
      data: structuredBalances,
    });
  } catch (error) {
    console.error("Leave balances error:", error.stack || error);
    res.status(500).json({
      error: "Failed to retrieve leave balances",
      details: error.message,
    });
  }
};

const getLeaveHistory = async (req, res) => {
  try {
    const { year, status, type } = req.query;
    const userId = req.user.id;

    const whereClause = { userId };

    if (year) {
      whereClause[Op.or] = [
        {
          fromDate: {
            [Op.between]: [`${year}-01-01`, `${year}-12-31`],
          },
        },
        {
          toDate: {
            [Op.between]: [`${year}-01-01`, `${year}-12-31`],
          },
        },
      ];
    }

    if (status) {
      whereClause.status = status;
    }

    if (type) {
      whereClause.type = type;
    }

    const leaves = await Leave.findAll({
      where: whereClause,
      order: [["fromDate", "DESC"]],
      attributes: [
        "id",
        "fromDate",
        "toDate",
        "type",
        "reason",
        "status",
        "createdAt",
      ],
    });

    if (!leaves || leaves.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No leave history found",
      });
    }

    res.json({
      success: true,
      data: leaves,
    });
  } catch (error) {
    console.error("Leave history error:", error.stack || error);
    res.status(500).json({
      error: "Failed to retrieve leave history",
      details: error.message,
    });
  }
};

export default {
  applyLeave,
  cancelLeave,
  getLeaveBalances,
  getLeaveHistory,
};
