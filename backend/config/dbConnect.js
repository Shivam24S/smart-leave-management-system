import path from "path";
import dotenv from "dotenv";

dotenv.config({
  path: path.resolve(process.cwd(), ".dev.env"),
});

import { Sequelize } from "sequelize";

console.log(process.env.DB_NAME);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: false,
  }
);

const dbConnect = async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connected successfully ");
  } catch (error) {
    console.error("DB connection failed:", error);
    throw error;
  }
};

export { sequelize, dbConnect };
