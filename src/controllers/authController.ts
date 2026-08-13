import type { NextFunction, Request, Response } from "express";
import {
	AuthConflictError,
	AuthValidationError,
	authService,
} from "../services/authService.js";
import { RegisterUserRequestModel } from "../models/authModels.js";
import logger from "../lib/logger.js";

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
			const requestModel = new RegisterUserRequestModel(
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
}

export const authController = new AuthController(authService);
