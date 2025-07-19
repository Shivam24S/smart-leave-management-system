import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConnect.js";

const AuditLog = sequelize.define("AuditLog", {
  actionType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  actionTarget: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  details: {
    type: DataTypes.TEXT,
  },
});

AuditLog.associate = (models) => {
  AuditLog.belongsTo(models.User, { foreignKey: "actionBy" });
};

export default AuditLog;
