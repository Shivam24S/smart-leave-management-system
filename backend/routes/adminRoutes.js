import express from "express";
import adminController from "../controllers/adminController.js";
import {
  validateCreateUser,
  validateUpdateUser,
} from "../middlewares/validate.js";
import roleCheck from "../middlewares/roleCheck.js";

const router = express.Router();

router.get(
  "/users",
  roleCheck(["admin", "manager"]),
  adminController.getAllUsers
);
router.post(
  "/users",
  roleCheck(["admin"]),
  validateCreateUser,
  adminController.createUser
);
router.put(
  "/users/:id",
  roleCheck(["admin"]),
  validateUpdateUser,
  adminController.updateUser
);
router.delete("/users/:id", roleCheck(["admin"]), adminController.deleteUser);
router.put(
  "/users/:userId/balance",
  roleCheck(["admin"]),
  adminController.updateLeaveBalance
);
router.get("/audit-logs", roleCheck(["admin"]), adminController.getAuditLogs);

export default router;
