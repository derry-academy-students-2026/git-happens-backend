import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import logger from "../lib/logger.js";
import { ApplyForRoleRequestModel } from "../models/jobApplicationModels.js";
import { jobRoleService } from "../services/jobRoleService.js";
import {
	JobRoleApplicationConflictError,
	JobRoleApplicationValidationError,
	JobRoleNotFoundError,
} from "../services/jobRoleService.js";

const applyForRoleSchema = z.object({
	fullName: z.string().trim().min(1, "Full name is required").max(120),
	countryCode: z
		.string()
		.trim()
		.regex(
			/^\+\d{1,3}$/,
			"Country code must be in format +XXX (e.g., +44)",
		),
	phoneNumber: z
		.string()
		.trim()
		.min(6, "Phone number must be at least 6 characters")
		.max(20, "Phone number must be less than 20 characters")
		.regex(
			/^[0-9\s\-()]+$/,
			"Phone number can only contain numbers, spaces, hyphens, and parentheses",
		),
	email: z
		.string()
		.trim()
		.email("Email must be a valid email address"),
	applicationText: z
		.string()
		.trim()
		.min(1, "Application text is required")
		.max(5000, "Application text must be less than 5000 characters"),
	previousExperience: z
		.string()
		.trim()
		.max(3000, "Previous experience must be less than 3000 characters")
		.optional(),
});

/**
 * @param service - The job role service instance used to fetch job role data.
 * Controller class for handling job role-related requests.
 * It interacts with the jobRoleService to fetch job role data and sends appropriate responses.
 */
export class JobRolesController {
	constructor(private service = jobRoleService) {}

	/**
	 * Fetches all job roles from the service and sends them in the response.
	 * If an error occurs, it logs the error and passes it to the next middleware.
	 * @param _req - The Express request object. Not used in this method.
	 * @param res - The Express response object.
	 * @param next - The next middleware function in the Express request-response cycle.
	 */
	async getJobRoles(
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const jobRoles = await this.service.getJobRoles();
			logger.debug(`Fetched ${jobRoles.length} job role(s)`);
			res.json(jobRoles);
		} catch (error) {
			const err = error instanceof Error ? error : new Error(String(error));
			logger.error(`Failed to fetch job roles: ${err.stack ?? err.message}`);
			next(err);
		}
	}

	/**
	 * Fetches a single job role by the ID in the request path.
	 * Responds with 400 if the ID is not a positive integer, 404 if no job role
	 * has that ID, and otherwise the job role itself.
	 * @param req - The Express request object, whose `id` path parameter holds the job role ID.
	 * @param res - The Express response object.
	 * @param next - The next middleware function in the Express request-response cycle.
	 */
	async getJobRoleById(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const jobRoleId = Number(req.params.id);

			if (!Number.isInteger(jobRoleId) || jobRoleId <= 0) {
				logger.warn(
					`Rejected job role request with invalid ID: ${req.params.id}`,
				);
				res.status(400).json({ error: "ID must be a positive integer" });
				return;
			}

			const jobRole = await this.service.getJobRoleById(jobRoleId);

			if (jobRole) {
				logger.debug(`Fetched job role ${jobRoleId}`);
				res.json(jobRole);
			} else {
				logger.info(`Job role ${jobRoleId} not found`);
				res.status(404).json({ message: "Job role not found" });
			}
		} catch (error) {
			const err = error instanceof Error ? error : new Error(String(error));
			logger.error(
				`Failed to fetch job role by ID: ${err.stack ?? err.message}`,
			);
			next(err);
		}
	}

	/**
	 * Creates a job application for the authenticated applicant.
	 * @param req - The Express request object containing role ID and application payload.
	 * @param res - The Express response object.
	 * @param next - The next middleware function in the Express request-response cycle.
	 */
	async applyForRole(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const jobRoleId = Number(req.params.id);
			if (!Number.isInteger(jobRoleId) || jobRoleId <= 0) {
				logger.warn(
					`Rejected application request with invalid role ID: ${req.params.id}`,
				);
				res.status(400).json({ error: "ID must be a positive integer" });
				return;
			}

			const userId = Number(res.locals.auth?.sub);
			if (!Number.isInteger(userId) || userId <= 0) {
				logger.warn("Rejected application request with missing auth subject", {
					roleId: req.params.id,
				});
				res.status(401).json({ message: "Authentication required" });
				return;
			}

			const parsedBody = applyForRoleSchema.safeParse(req.body);
			if (!parsedBody.success) {
				logger.warn("Rejected application request due to invalid payload", {
					roleId: jobRoleId,
					userId,
					issue: parsedBody.error.issues[0]?.message,
				});
				res.status(400).json({
					message: parsedBody.error.issues[0]?.message ?? "Invalid request payload",
				});
				return;
			}

			const requestModel = new ApplyForRoleRequestModel(
				parsedBody.data.fullName,
				parsedBody.data.countryCode,
				parsedBody.data.phoneNumber,
				parsedBody.data.email,
				parsedBody.data.applicationText,
				parsedBody.data.previousExperience,
			);

			const application = await this.service.applyForRole(
				jobRoleId,
				userId,
				requestModel.fullName,
				requestModel.countryCode,
				requestModel.phoneNumber,
				requestModel.email,
				requestModel.applicationText,
				requestModel.previousExperience,
			);

			logger.info("Created role application", {
				roleId: jobRoleId,
				userId,
				applicationId: application.applicationId,
			});

			res.status(201).json(application);
		} catch (error) {
			if (error instanceof JobRoleApplicationValidationError) {
				logger.warn(`Application validation failed: ${error.message}`);
				res.status(error.statusCode).json({ message: error.message });
				return;
			}

			if (error instanceof JobRoleNotFoundError) {
				logger.info(`Application target role not found: ${error.message}`);
				res.status(error.statusCode).json({ message: error.message });
				return;
			}

			if (error instanceof JobRoleApplicationConflictError) {
				logger.warn(`Application conflict: ${error.message}`);
				res.status(error.statusCode).json({ message: error.message });
				return;
			}

			const err = error instanceof Error ? error : new Error(String(error));
			logger.error(`Failed to apply for role: ${err.stack ?? err.message}`);
			next(err);
		}
	}
}
