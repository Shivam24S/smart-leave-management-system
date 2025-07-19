const roleCheck = (roles) => {
  if (!Array.isArray(roles)) {
    throw new Error("Roles must be an array");
  }

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Access denied. Insufficient permissions.",
        requiredRoles: roles,
        userRole: req.user.role,
      });
    }

    next();
  };
};

export default roleCheck;
