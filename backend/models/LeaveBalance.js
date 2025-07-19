import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConnect.js";

const LeaveBalance = sequelize.define("LeaveBalance", {
  type: {
    type: DataTypes.ENUM("casual", "sick", "annual"),
    allowNull: false,
  },
  balance: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: new Date().getFullYear(),
  },
});

LeaveBalance.associate = (models) => {
  LeaveBalance.belongsTo(models.User, { foreignKey: "userId" });
};

export default LeaveBalance;
