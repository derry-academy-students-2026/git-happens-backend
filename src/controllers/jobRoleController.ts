import type { Request, Response } from "express";
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
	 * Fetches a page of job roles from the service and sends them in the response.
	 * The page number is read from the `page` query parameter (defaults to 1).
	 * Responds with 400 if `page` is present but not a positive integer.
	 * If an error occurs, it logs the error and passes it to the next middleware.
	 * @param req - The Express request object, whose `page` query parameter selects the page to fetch.
	 * @param res - The Express response object.
	 */
	async getJobRoles(
		req: Request,
		res: Response,
	): Promise<void> {
		try {
			const rawPage = req.query.page;
			const page = rawPage === undefined ? 1 : Number(rawPage);

			if (!Number.isInteger(page) || page <= 0) {
				logger.warn(`Rejected job roles request with invalid page: ${rawPage}`);
				res.status(400).json({ error: "page must be a positive integer" });
				return;
			}

			const jobRoles = await this.service.getJobRoles(page);
			logger.debug(`Fetched ${jobRoles.jobRoles.length} job role(s)`);
			res.json(jobRoles);
		} catch (error) {
			const err = error instanceof Error ? error : new Error(String(error));
			logger.error(`Failed to fetch job roles: ${err.stack ?? err.message}`);
			res.status(500).json({ message: "Internal server error" });
		}
	}

	/**
	 * Fetches a single job role by the ID in the request path.
	 * Responds with 400 if the ID is not a positive integer, 404 if no job role
	 * has that ID, and otherwise the job role itself.
	 * @param req - The Express request object, whose `id` path parameter holds the job role ID.
	 * @param res - The Express response object.
	 */
	async getJobRoleById(
		req: Request,
		res: Response,
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
			res.status(500).json({ message: "Internal server error" });
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
			const err = error instanceof Error ? error : new Error(String(error));
			logger.error(`Failed to create job role: ${err.stack ?? err.message}`);
			res.status(500).json({ message: "Internal server error" });
		}
	}
}
