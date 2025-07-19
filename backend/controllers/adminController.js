import User from "../models/User.js";
import LeaveBalance from "../models/LeaveBalance.js";
import AuditLog from "../models/AuditLog.js";
import createAuditLog from "../services/userService.js";
import bcrypt from "bcrypt";

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: LeaveBalance,
          as: "leaveBalances",
        },
      ],
      attributes: { exclude: ["password"] },
    });

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, error: "Failed to fetch users" });
  }
};

const createUser = async (req, res) => {
  try {
    const { password, ...userData } = req.body;
    const user = await User.create({
      ...userData,
      password: await bcrypt.hash(password, 10),
    });

    const leaveTypes = ["casual", "sick", "annual"];
    const leaveBalances = await Promise.all(
      leaveTypes.map((type) =>
        LeaveBalance.create({
          userId: user.id,
          type,
          balance: type === "annual" ? 15 : type === "casual" ? 12 : 10,
          year: new Date().getFullYear(),
        })
      )
    );

    await createAuditLog({
      actionBy: req.user.id,
      actionType: "user_creation",
      actionTarget: `user_${user.id}`,
      details: `Created user ${user.name} (${user.email}) with role ${user.role}`,
    });

    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(201).json({ success: true, data: userResponse });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(400).json({ success: false, error: "Failed to create user" });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const { password, ...updateData } = req.body;

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await user.update(updateData);

    await createAuditLog({
      actionBy: req.user.id,
      actionType: "user_update",
      actionTarget: `user_${user.id}`,
      details: `Updated user ${user.name} (${user.email})`,
    });

    const userResponse = user.toJSON();
    delete userResponse.password;

    res.json({ success: true, data: userResponse });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(400).json({ success: false, error: "Failed to update user" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (user.id === req.user.id) {
      return res.status(403).json({
        success: false,
        error: "You cannot delete your own account",
      });
    }

    await user.destroy();

    await createAuditLog({
      actionBy: req.user.id,
      actionType: "user_deletion",
      actionTarget: `user_${req.params.id}`,
      details: `Deleted user ${user.name} (${user.email})`,
    });

    res.json({ success: true, data: { id: req.params.id } });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, error: "Failed to delete user" });
  }
};

const updateLeaveBalance = async (req, res) => {
  try {
    const { type, balance, year } = req.body;

    if (balance < 0) {
      return res.status(400).json({
        success: false,
        error: "Balance cannot be negative",
      });
    }

    const [leaveBalance, created] = await LeaveBalance.findOrCreate({
      where: {
        userId: req.params.userId,
        type,
        year: year || new Date().getFullYear(),
      },
      defaults: {
        userId: req.params.userId,
        type,
        balance,
        year: year || new Date().getFullYear(),
      },
    });

    if (!created) {
      leaveBalance.balance = balance;
      await leaveBalance.save();
    }

    await createAuditLog({
      actionBy: req.user.id,
      actionType: "balance_update",
      actionTarget: `user_${req.params.userId}`,
      details: `Updated ${type} leave balance to ${balance} for year ${
        year || new Date().getFullYear()
      }`,
    });

    res.json({ success: true, data: leaveBalance });
  } catch (error) {
    console.error("Error updating leave balance:", error);
    res
      .status(400)
      .json({ success: false, error: "Failed to update leave balance" });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const logs = await AuditLog.findAndCountAll({
      include: [
        { model: User, as: "User", attributes: ["id", "name", "email"] },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        total: logs.count,
        page: parseInt(page),
        pages: Math.ceil(logs.count / limit),
        logs: logs.rows,
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch audit logs" });
  }
};

export default {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  updateLeaveBalance,
  getAuditLogs,
};
