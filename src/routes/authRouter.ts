import { Router } from "express";
import { authController } from "../controllers/authController.js";

const authRouter = Router();

/**
 * Handles user registration.
 */
authRouter.post("/register", (req, res) =>
	authController.register(req, res),
);

/**
 * Handles user login.
 */
authRouter.post("/login", (req, res) =>
	authController.login(req, res),
);

export default authRouter;
