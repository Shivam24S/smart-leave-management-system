import cron from "node-cron";
import LeaveBalance from "../models/LeaveBalance.js";

const resetLeaveBalances = () => {
  cron.schedule("0 0 1 1 *", async () => {
    const currentYear = new Date().getFullYear();
    const users = await User.findAll();

    for (const user of users) {
      await LeaveBalance.update(
        { balance: 0 },
        { where: { userId: user.id, year: currentYear - 1 } }
      );

      await LeaveBalance.findOrCreate({
        where: { userId: user.id, type: "casual", year: currentYear },
        defaults: { balance: 12 },
      });

      await LeaveBalance.findOrCreate({
        where: { userId: user.id, type: "sick", year: currentYear },
        defaults: { balance: 10 },
      });

      await LeaveBalance.findOrCreate({
        where: { userId: user.id, type: "annual", year: currentYear },
        defaults: { balance: 15 },
      });
    }
  });
};

export default resetLeaveBalances;
