import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConnect.js";

const Leave = sequelize.define(
  "Leave",
  {
    fromDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    toDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("casual", "sick", "annual"),
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    managerComment: {
      type: DataTypes.TEXT,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "Leave",
  }
);

export default Leave;

export function setupLeaveAssociations(User) {
  Leave.belongsTo(User, {
    foreignKey: "userId",
    as: "User",
  });
}
