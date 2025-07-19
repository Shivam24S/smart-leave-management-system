import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConnect.js";

const User = sequelize.define(
  "User",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("employee", "manager", "admin"),
      allowNull: false,
      defaultValue: "employee",
    },
    managerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "User",
    timestamps: true,
  }
);

export default User;

export function setupUserAssociations(Leave, LeaveBalance) {
  User.belongsTo(User, {
    as: "manager",
    foreignKey: "managerId",
    onDelete: "SET NULL",
  });

  User.hasMany(Leave, {
    foreignKey: "userId",
    as: "leaves",
    onDelete: "CASCADE",
  });

  User.hasMany(LeaveBalance, {
    foreignKey: "userId",
    as: "leaveBalances",
    onDelete: "CASCADE",
  });
}
