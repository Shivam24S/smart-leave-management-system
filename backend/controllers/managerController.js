import httpError from "../middlewares/errorHandler.js";
import Leave from "../models/Leave.js";
import LeaveBalance from "../models/LeaveBalance.js";
import User from "../models/User.js";
import { Op } from "sequelize";
import createAuditLog from "../services/userService.js";

const LEAVE_TYPES = ["annual", "sick", "unpaid", "maternity"];
const MAX_LEAVE_DAYS = 30;

const getTeamLeaveRequests = async (req, res, next) => {
  try {
    const { status, month, year, page = 1, limit = 10 } = req.query;
    const managerId = req.user.id;

    if (month && isNaN(month)) {
      throw new httpError("Month must be a number", 400);
    }

    if (year && isNaN(year)) {
      throw new httpError("Year must be a number", 400);
    }

    if (
      status &&
      !["pending", "approved", "rejected", "all"].includes(status)
    ) {
      throw new httpError("Invalid status value", 400);
    }

    const teamMembers = await User.findAll({
      where: { managerId },
      attributes: ["id", "name"],
    });

    if (!teamMembers.length) {
      return res.json({
        success: true,
        data: [],
        message: "No team members found",
      });
    }

    const teamMemberIds = teamMembers.map((member) => member.id);

    const where = {
      userId: teamMemberIds,
    };

    if (status && status !== "all") {
      where.status = status;
    }

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      where[Op.or] = [
        {
          [Op.and]: [
            { fromDate: { [Op.lte]: endDate } },
            { toDate: { [Op.gte]: startDate } },
          ],
        },
      ];
    }

    const offset = (page - 1) * limit;
    const leaves = await Leave.findAll({
      where,
      include: [
        {
          model: User,
          as: "User",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["fromDate", "ASC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const total = await Leave.count({ where });

    res.json({
      success: true,
      data: leaves,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        perPage: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const approveRejectLeave = async (req, res, next) => {
  try {
    const { status, comment } = req.body;
    const leave = req.leave;

    if (!["approved", "rejected"].includes(status)) {
      throw new httpError(
        "Status must be either 'approved' or 'rejected'",
        400
      );
    }

    if (status === "approved" && !LEAVE_TYPES.includes(leave.type)) {
      throw new httpError(`Invalid leave type: ${leave.type}`, 400);
    }

    if (leave.status !== "pending") {
      throw new httpError(`Cannot modify already ${leave.status} leave`, 400);
    }

    const leaveDays =
      Math.ceil(
        (new Date(leave.toDate) - new Date(leave.fromDate)) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    const balance = await LeaveBalance.findOne({
      where: {
        userId: leave.userId,
        type: leave.type,
        year: new Date(leave.fromDate).getFullYear(),
      },
    });

    if (status === "approved") {
      if (leaveDays > MAX_LEAVE_DAYS) {
        throw new httpError(
          `Cannot approve leaves longer than ${MAX_LEAVE_DAYS} days`,
          400
        );
      }
      if (!balance) {
        throw new httpError("Leave balance record not found for employee", 404);
      }
      if (balance.balance < leaveDays) {
        throw new httpError(
          `Insufficient balance. Requested: ${leaveDays}, Available: ${balance.balance}`,
          400
        );
      }
      await balance.decrement("balance", { by: leaveDays });
    }

    if (status === "rejected" && leave.status === "approved" && balance) {
      await balance.increment("balance", { by: leaveDays });
    }

    leave.status = status;
    leave.managerComment = comment || null;
    leave.processedAt = new Date();
    await leave.save();

    await createAuditLog({
      actionBy: req.user.id,
      actionType: `leave_${status}`,
      actionTarget: `leave_${leave.id}`,
      details: `${status} leave request for ${leave.User.name}`,
      metadata: {
        leaveId: leave.id,
        userId: leave.userId,
        days: leave.days,
        type: leave.type,
      },
    });

    res.json({
      success: true,
      data: leave,
      message: `Leave request ${status} successfully`,
    });
  } catch (error) {
    next(error);
  }
};

const getTeamLeaveCalendar = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const managerId = req.user.id;

    if (!month || !year) {
      throw new httpError("Both month and year parameters are required", 400);
    }

    const numericMonth = parseInt(month);
    const numericYear = parseInt(year);

    if (isNaN(numericMonth)) {
      throw new httpError("Month must be a number between 1-12", 400);
    }

    if (numericMonth < 1 || numericMonth > 12) {
      throw new httpError("Month must be between 1-12", 400);
    }

    const teamMembers = await User.findAll({
      where: { managerId },
      attributes: ["id", "name", "email"],
    });

    if (!teamMembers.length) {
      return res.json({
        success: true,
        data: { teamMembers: [], leaves: [] },
        message: "No team members found",
      });
    }

    const teamMemberIds = teamMembers.map((member) => member.id);

    const startDate = new Date(numericYear, numericMonth - 1, 1);
    const endDate = new Date(numericYear, numericMonth, 0, 23, 59, 59);

    const leaves = await Leave.findAll({
      where: {
        userId: teamMemberIds,
        status: "approved",
        [Op.or]: [
          {
            [Op.and]: [
              { fromDate: { [Op.lte]: endDate } },
              { toDate: { [Op.gte]: startDate } },
            ],
          },
        ],
      },
      include: [
        {
          model: User,
          as: "User",
          attributes: ["id", "name"],
        },
      ],
      order: [["fromDate", "ASC"]],
    });

    const calendarData = leaves.map((leave) => {
      const fromDate = new Date(leave.fromDate);
      const toDate = new Date(leave.toDate);
      const days = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;

      return {
        id: leave.id,
        title: `${leave.User.name} - ${leave.type} (${days} day${
          days > 1 ? "s" : ""
        })`,
        start: leave.fromDate,
        end: toDate.setHours(23, 59, 59),
        type: leave.type,
        status: leave.status,
        userId: leave.userId,
        userName: leave.User.name,
        allDay: true,
        className: `leave-type-${leave.type}`,
        extendedProps: {
          description: leave.reason,
          managerComment: leave.managerComment,
        },
      };
    });

    res.json({
      success: true,
      data: {
        teamMembers,
        leaves: calendarData,
        month: numericMonth,
        year: numericYear,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getTeamMembers = async (req, res, next) => {
  try {
    const teamMembers = await User.findAll({
      where: { managerId: req.user.id },
      attributes: {
        exclude: ["password"],
        include: [
          ["id", "id"],
          ["name", "name"],
          ["email", "email"],
          ["role", "role"],
        ],
      },
      order: [["name", "ASC"]],
    });

    res.json({
      success: true,
      data: teamMembers,
      count: teamMembers.length,
    });
  } catch (error) {
    next(error);
  }
};

const getLeaveDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: "User",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!leave) {
      throw new httpError("Leave request not found", 404);
    }

    const teamMember = await User.findOne({
      where: {
        id: leave.userId,
        managerId: req.user.id,
      },
    });

    if (!teamMember) {
      throw new httpError("Unauthorized to view this leave request", 403);
    }

    res.json({
      success: true,
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};
export default {
  getTeamLeaveRequests,
  approveRejectLeave,
  getTeamLeaveCalendar,
  getTeamMembers,
  getLeaveDetails,
};
