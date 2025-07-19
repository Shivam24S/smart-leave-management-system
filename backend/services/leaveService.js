import { Leave, LeaveBalance } from "../models/initModels.js";
import { Op } from "sequelize";

export const initializeLeaveBalances = async (
  userId,
  year = new Date().getFullYear()
) => {
  const defaultBalances = {
    casual: 10,
    sick: 15,
    annual: 12,
  };

  for (const [type, amount] of Object.entries(defaultBalances)) {
    await LeaveBalance.findOrCreate({
      where: { userId, type, year },
      defaults: { balance: amount },
    });
  }
};

export const restoreLeaveBalance = async (userId, type, year) => {
  await initializeLeaveBalances(userId, year);
  const balance = await LeaveBalance.findOne({
    where: { userId, type, year },
  });

  if (balance) {
    return await balance.increment("balance", { by: 1 });
  }
  return null;
};

export const checkLeaveOverlap = async (userId, fromDate, toDate) => {
  return await Leave.findOne({
    where: {
      userId,
      [Op.or]: [
        {
          [Op.and]: [
            { fromDate: { [Op.lte]: toDate } },
            { toDate: { [Op.gte]: fromDate } },
            { status: { [Op.in]: ["pending", "approved"] } },
          ],
        },
      ],
    },
  });
};

export const deductLeaveBalance = async (userId, type, year) => {
  await initializeLeaveBalances(userId);

  const balance = await LeaveBalance.findOne({
    where: { userId, type, year },
  });

  if (!balance || balance.balance <= 0) {
    throw new Error(`Insufficient ${type} leave balance`);
  }

  const updatedBalance = await balance.decrement("balance", { by: 1 });
  return updatedBalance.balance;
};

export const getLeaveBalance = async (userId, type, year) => {
  await initializeLeaveBalances(userId);
  const balance = await LeaveBalance.findOne({
    where: { userId, type, year },
  });
  return balance ? balance.balance : 0;
};
