export const validateLeaveDates = (req, res, next) => {
  const { fromDate } = req.body;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const leaveDate = new Date(fromDate);
  leaveDate.setHours(0, 0, 0, 0);

  if (req.user.role === "admin") {
    console.log(
      `Admin override: ${req.user.email} applied leave from ${fromDate}`
    );
    return next();
  }

  if (leaveDate < today) {
    return res.status(403).json({
      success: false,
      error: "Only admins can apply backdated leaves",
      validFrom: today.toISOString().split("T")[0],
      solution:
        "Please contact your administrator for backdated leave requests",
      adminContact: "hr@company.com",
    });
  }

  next();
};
