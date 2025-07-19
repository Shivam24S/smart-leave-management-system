import express from "express";
import managerController from "../controllers/managerController.js";
import {
  validateProcessLeave,
  validateTeamLeaveQuery,
} from "../middlewares/validate.js";
import {
  validateManagerAccess,
  validateTeamAvailability,
} from "../middlewares/leaveValidator.js";
import auth from "../middlewares/auth.js";
import roleCheck from "../middlewares/roleCheck.js";

const router = express.Router();

router.get(
  "/team/members",
  auth,
  roleCheck(["manager"]),
  managerController.getTeamMembers
);

router.get(
  "/team/leaves",
  auth,
  roleCheck(["manager"]),
  validateTeamLeaveQuery,
  managerController.getTeamLeaveRequests
);

router.put(
  "/leaves/:id",
  auth,
  roleCheck(["manager"]),
  validateProcessLeave,
  validateManagerAccess,
  validateTeamAvailability,
  managerController.approveRejectLeave
);

router.get(
  "/team/calendar",
  auth,
  roleCheck(["manager"]),
  validateTeamLeaveQuery,
  managerController.getTeamLeaveCalendar
);

router.get("/leaves/:id", managerController.getLeaveDetails);

export default router;
