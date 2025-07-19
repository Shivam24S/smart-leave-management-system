import { Op } from "sequelize";
import httpError from "./errorHandler.js";
import Leave from "../models/Leave.js";
import User from "../models/User.js";

export const validateManagerAccess = async (req, res, next) => {
  try {
    const leaveId = req.params.id;
    const managerId = req.user.id;

    const leave = await Leave.findByPk(leaveId, {
      include: [
        {
          model: User,
          as: "User",
          attributes: ["id", "managerId"],
        },
      ],
    });

    if (!leave) {
      throw new httpError("Leave request not found", 404);
    }

    if (leave.User.managerId !== managerId) {
      throw new httpError("Not authorized to process this leave request", 403);
    }

    req.leave = leave;
    next();
  } catch (error) {
    next(error);
  }
};

export const validateTeamAvailability = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.body;
    const managerId = req.user.id;
    const maxConcurrentLeaves = 3;

    const teamMembers = await User.findAll({
      where: { managerId },
      attributes: ["id"],
    });

    const teamMemberIds = teamMembers.map((member) => member.id);

    const concurrentLeaves = await Leave.count({
      where: {
        userId: teamMemberIds,
        status: "approved",
        [Op.or]: [
          { fromDate: { [Op.between]: [fromDate, toDate] } },
          { toDate: { [Op.between]: [fromDate, toDate] } },
        ],
      },
    });

    if (concurrentLeaves >= maxConcurrentLeaves) {
      throw new httpError(
        "Too many team members on leave during this period",
        400,
        {
          current: concurrentLeaves,
          maxAllowed: maxConcurrentLeaves,
        }
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
