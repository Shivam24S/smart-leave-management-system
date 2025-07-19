import AuditLog from "../models/AuditLog.js";

const createAuditLog = async ({
  actionBy,
  actionType,
  actionTarget,
  details,
}) => {
  try {
    return await AuditLog.create({
      actionBy,
      actionType,
      actionTarget,
      details,
    });
  } catch (error) {
    console.error("Error creating audit log:", error);
    return null;
  }
};

export default createAuditLog;
