import express from "express";
import cors from "cors";
import helmet from "helmet";

import httpError from "./middlewares/errorHandler.js";
import routes from "./routes/index.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/api", routes);

app.get("/", (req, res) => {
  res.json("hello");
});

app.use((req, res, next) => {
  next(new httpError("requested route not found", 404));
});

app.use((error, req, res, next) => {
  if (req.headerSent) {
    next(error);
  }
  res.status(error.statusCode || 500).json({
    message: error.message || "something went wrong, please try again later",
    ...(error.details && { details: error.details }),
  });
});

export default app;
