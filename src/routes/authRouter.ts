import { Router } from "express";
import { authController } from "../controllers/authController.js";

const authRouter = Router();

/**
 * Handles user registration.
 */
authRouter.post("/register", (req, res, next) =>
	authController.register(req, res, next),
);

/**
 * Handles user login.
 */
authRouter.post("/login", (req, res, next) =>
	authController.login(req, res, next),
);

/**
 * Handles user logout.
 */
authRouter.post("/logout", (req, res) => authController.logout(req, res));

export default authRouter;
