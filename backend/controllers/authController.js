import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import createAuditLog from "../services/userService.js";

const register = async (req, res) => {
  try {
    const { name, email, password, role, managerId } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      managerId,
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    try {
      await createAuditLog({
        actionBy: user.id,
        actionType: "user_registration",
        actionTarget: `user_${user.id}`,
        details: "New user registered",
      });
    } catch (auditError) {
      console.warn("Audit log failed:", auditError.message);
    }

    res.status(201).json({ user, token });
  } catch (error) {
    console.error("Register error:", error);
    res.status(400).json({ error: error.message || "Something went wrong" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    await createAuditLog({
      actionBy: user.id,
      actionType: "user_login",
      actionTarget: `user_${user.id}`,
      details: "User logged in",
    });

    res.json({ user, token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export default { register, login, getCurrentUser };
