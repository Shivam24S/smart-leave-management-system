import path from "path";
import dotenv from "dotenv";
import "./models/initModels.js";
import resetLeaveBalances from "./utils/cron.js";

dotenv.config({
  path: path.resolve(process.cwd(), ".dev.env"),
});

import http from "http";

import app from "./app.js";
import { sequelize, dbConnect } from "./config/dbConnect.js";

const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await dbConnect();

    await sequelize.sync({ alter: true });
    console.log("db synced successfully");

    resetLeaveBalances();
    console.log("Cron jobs initialized");

    server.listen(PORT, (err) => {
      if (err) {
        return console.log("server starting error", err.message);
      }
      console.log(`server is listening on  port ${PORT}`);
    });
  } catch (error) {
    console.log(error.message);
  }
};

startServer();
