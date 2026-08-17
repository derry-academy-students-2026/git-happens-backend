import type { NextFunction, Request, Response } from "express";
import logger from "../lib/logger.js";
import { jobRoleService } from "../services/jobRoleService.js";

/**
 * @param service - The job role service instance used to fetch job role data.
 * Controller class for handling job role-related requests.
 * It interacts with the jobRoleService to fetch job role data and sends appropriate responses.
 */
export class JobRolesController {
	constructor(private service = jobRoleService) {}

	/**
	 * Fetches a page of job roles from the service and sends them in the response.
	 * The page number is read from the `page` query parameter (defaults to 1).
	 * Responds with 400 if `page` is present but not a positive integer.
	 * If an error occurs, it logs the error and passes it to the next middleware.
	 * @param req - The Express request object, whose `page` query parameter selects the page to fetch.
	 * @param res - The Express response object.
	 * @param next - The next middleware function in the Express request-response cycle.
	 */
	async getJobRoles(
		req: Request,
		res: Response,
		next: NextFunction,
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
}
