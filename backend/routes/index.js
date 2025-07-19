import express from "express";
import User from "../models/User.js";
import authRoutes from "./authRoutes.js";
import employeeRoutes from "./employeeRoutes.js";
import managerRoutes from "./managerRoutes.js";
import adminRoutes from "./adminRoutes.js";
import auth from "../middlewares/auth.js";
import roleCheck from "../middlewares/roleCheck.js";

const router = express.Router();

router.get("/managers", async (req, res) => {
  try {
    const managers = await User.findAll({
      where: { role: "manager" },
      attributes: ["id", "name", "email"],
    });
    res.json(managers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch managers" });
  }
});

router.use("/auth", authRoutes);
router.use("/employee", auth, roleCheck(["employee"]), employeeRoutes);
router.use("/manager", auth, roleCheck(["manager"]), managerRoutes);
router.use("/admin", auth, roleCheck(["admin"]), adminRoutes);

export default router;
