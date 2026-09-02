import type { NextFunction, Request, Response } from "express";
import { JobRoleValidationError } from "../errors/customErrors.js";
import logger from "../lib/logger.js";
import type { JobRoleService } from "../services/jobRoleService.js";
import type { CreateJobRoleRequestDto } from "../validation/jobRoleSchemas.js";

/**
 * Controller class for handling job role-related requests.
 * It interacts with the jobRoleService to fetch job role data and sends appropriate responses.
 */
export class JobRolesController {
	constructor(private service: JobRoleService) {}

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
	 * Creates a new job role from a body already validated by `validateBody`.
	 * @param req - The Express request object, whose body holds the new job role.
	 * @param res - The Express response object.
	 * @param next - The next middleware function in the Express request-response cycle.
	 */
	async createJobRole(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const jobRole = await this.service.createJobRole(
				req.body as CreateJobRoleRequestDto,
			);
			res.status(201).json(jobRole);
		} catch (error) {
			if (error instanceof JobRoleValidationError) {
				res.status(error.statusCode).json({ message: error.message });
				return;
			}
			next(error instanceof Error ? error : new Error(String(error)));
		}
	}
}
