import express from "express";
import authController from "../controllers/authController.js";
import { validateRegister, validateLogin } from "../middlewares/validate.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", validateRegister, authController.register);
router.post("/login", validateLogin, authController.login);
router.get("/me", auth, authController.getCurrentUser);

export default router;
