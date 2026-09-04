import type { Request, Response } from "express";
import {
	ApplicationConflictError,
	ApplicationNotFoundError,
	ApplicationValidationError,
} from "../errors/applicationErrors.js";
import logger from "../lib/logger.js";
import { ApplyForRoleRequestModel } from "../models/jobApplicationModels.js";
import type { ApplicationService } from "../services/applicationService.js";
import type { ApplyForRoleRequestDto } from "../validation/applicationSchemas.js";

export class ApplicationController {
	constructor(private service: ApplicationService) {}

	/**
	 * Submits a validated application for the selected job role.
	 * @param req Request containing a validated application payload.
	 * @param res Response containing validated path and authentication values.
	 */
	async submitJobApplication(
		req: Request,
		res: Response,
	): Promise<void> {
		try {
			const { jobRoleId } = res.locals.params as { jobRoleId: number };
			const userId = res.locals.authUserId as number;
			const body = req.body as ApplyForRoleRequestDto;
			const request = new ApplyForRoleRequestModel(
				body.fullName,
				body.countryCode,
				body.phoneNumber,
				body.email,
				body.applicationText,
				body.previousExperience,
			);
			const application = await this.service.submitJobApplication(
				jobRoleId,
				userId,
				request,
			);

			logger.info("Created job application", {
				jobRoleId,
				userId,
				applicationId: application.applicationId,
			});
			res.status(201).json(application);
		} catch (error) {
			if (
				error instanceof ApplicationValidationError ||
				error instanceof ApplicationNotFoundError ||
				error instanceof ApplicationConflictError
			) {
				res.status(error.statusCode).json({ message: error.message });
				return;
			}

			const err = error instanceof Error ? error : new Error(String(error));
			logger.error(`Failed to submit job application: ${err.stack ?? err.message}`);
			res.status(500).json({ message: "Internal server error" });
		}
	}

	/**
	 * Lists job applications for the requested authenticated user.
	 * @param _req Request object; validated path data is stored in `res.locals`.
	 * @param res Response containing validated path and authentication values.
	 */
	async getApplicationsByUserId(_req: Request, res: Response): Promise<void> {
		try {
			const { userId } = res.locals.params as { userId: number };
			const authUserId = res.locals.authUserId as number;

			if (userId !== authUserId) {
				logger.warn("Rejected job application list request for another user", {
					userId,
					authUserId,
				});
				res.status(403).json({ message: "Forbidden" });
				return;
			}

			const applications = await this.service.getApplicationsByUserId(userId);

			logger.debug(
				`Fetched ${applications.length} job application(s) for user ${userId}`,
			);
			res.json(applications);
		} catch (error) {
			if (error instanceof ApplicationValidationError) {
				res.status(error.statusCode).json({ message: error.message });
				return;
			}

			const err = error instanceof Error ? error : new Error(String(error));
			logger.error(`Failed to fetch job applications: ${err.stack ?? err.message}`);
			res.status(500).json({ message: "Internal server error" });
		}
	}
}
