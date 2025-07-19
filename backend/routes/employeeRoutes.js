import express from "express";
import employeeController from "../controllers/employeeController.js";
import { validateApplyLeave } from "../middlewares/validate.js";
import auth from "../middlewares/auth.js";
import roleCheck from "../middlewares/roleCheck.js";
import { validateLeaveDates } from "../middlewares/validateLeaveDates.js";

const router = express.Router();

router.post(
  "/leaves",
  auth,
  roleCheck(["employee", "admin"]),
  validateLeaveDates,
  validateApplyLeave,
  employeeController.applyLeave
);
router
  .route("/leaves/:id")
  .delete(auth, roleCheck(["employee"]), employeeController.cancelLeave);

router.get(
  "/balances",
  auth,
  roleCheck(["employee"]),
  employeeController.getLeaveBalances
);

router.get(
  "/leaves/history",
  auth,
  roleCheck(["employee"]),
  employeeController.getLeaveHistory
);

export default router;
