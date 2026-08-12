import { Router } from "express";
import { authController } from "../controllers/authController.js";

const authRouter = Router();

/**
 * Handles user registration.
 */
authRouter.post("/register", (req, res, next) =>
	authController.register(req, res, next),
);

export default authRouter;
