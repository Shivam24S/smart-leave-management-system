import User from "./User.js";
import Leave from "./Leave.js";
import LeaveBalance from "./LeaveBalance.js";
import AuditLog from "./AuditLog.js";
import { setupUserAssociations } from "./User.js";
import { setupLeaveAssociations } from "./Leave.js";

setupUserAssociations(Leave, LeaveBalance);
setupLeaveAssociations(User);
if (AuditLog.associate) AuditLog.associate({ User });
if (LeaveBalance.associate) LeaveBalance.associate({ User });

export { User, Leave, LeaveBalance, AuditLog };
