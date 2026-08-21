import type { NextFunction, Request, Response } from "express";
import logger from "../lib/logger.js";
import { maskEmail } from "../lib/maskEmail.js";
import { UserRequestModel } from "../models/authModels.js";
import {
	AuthConflictError,
	AuthUnauthorizedError,
	AuthValidationError,
	authService,
} from "../services/authService.js";

export class AuthController {
	constructor(private service = authService) {}

	/**
	 * Handles user registration requests.
	 * @param req Express request carrying user registration details.
	 * @param res Express response used to send API output.
	 * @param next Express next middleware callback for unexpected failures.
	 * @returns Promise that resolves when the response is sent.
	 */
	async register(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			logger.info("Registration request received");
			const requestModel = new UserRequestModel(
				String(req.body?.email ?? ""),
				String(req.body?.password ?? ""),
			);
			const createdUser = await this.service.registerUser(
				requestModel.email,
				requestModel.password,
			);
			logger.info("Registration succeeded", {
				email: maskEmail(createdUser.email),
			});
			res.status(201).json(createdUser);
		} catch (error: unknown) {
			if (error instanceof AuthValidationError) {
				logger.warn(`Registration validation failed: ${error.message}`);
				res.status(error.statusCode).json({ message: error.message });
				return;
			}

			if (error instanceof AuthConflictError) {
				logger.warn(`Registration conflict: ${error.message}`);
				res.status(error.statusCode).json({ message: error.message });
				return;
			}

			logger.error("Registration failed with unexpected error", { error });
			next(error);
		}
	}

	/**
	 * Handles user login requests and returns a JWT on success.
	 * @param req Express request carrying login details.
	 * @param res Express response used to send API output.
	 * @param next Express next middleware callback for unexpected failures.
	 * @returns Promise that resolves when the response is sent.
	 */
	async login(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			logger.info("Login request received");
			const requestModel = new UserRequestModel(
				String(req.body?.email ?? ""),
				String(req.body?.password ?? ""),
			);
			const loggedInUser = await this.service.loginUser(
				requestModel.email,
				requestModel.password,
			);
			logger.info("Login succeeded", {
				email: maskEmail(loggedInUser.email),
				role: loggedInUser.role,
			});
			res.status(200).json(loggedInUser);
		} catch (error: unknown) {
			if (error instanceof AuthUnauthorizedError) {
				logger.warn("Login failed: invalid credentials");
				res.status(error.statusCode).json({ message: error.message });
				return;
			}

			logger.error("Login failed with unexpected error", { error });
			next(error);
		}
	}
}

export const authController = new AuthController(authService);
