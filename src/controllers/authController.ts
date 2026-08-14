import type { NextFunction, Request, Response } from "express";
import logger from "../lib/logger.js";
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
	 */
	async register(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const requestModel = new UserRequestModel(
				String(req.body?.email ?? ""),
				String(req.body?.password ?? ""),
			);
			const createdUser = await this.service.registerUser(
				requestModel.email,
				requestModel.password,
			);
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

			next(error);
		}
	}

	/**
	 * Handles user login requests and returns a JWT on success.
	 */
	async login(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const requestModel = new UserRequestModel(
				String(req.body?.email ?? ""),
				String(req.body?.password ?? ""),
			);
			const loggedInUser = await this.service.loginUser(
				requestModel.email,
				requestModel.password,
			);
			res.status(200).json(loggedInUser);
		} catch (error: unknown) {
			if (error instanceof AuthUnauthorizedError) {
				logger.warn("Login failed: invalid credentials");
				res.status(error.statusCode).json({ message: error.message });
				return;
			}

			next(error);
		}
	}

	/**
	 * Handles logout. The JWT is stateless, so the client discards its copy;
	 * this endpoint exists to give the frontend a single place to call.
	 */
	logout(_req: Request, res: Response): void {
		res.status(200).json({ message: "Logged out successfully" });
	}
}

export const authController = new AuthController(authService);
