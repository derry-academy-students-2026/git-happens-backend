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

	// handles GET /job-roles and GET /job-roles/:id, responding with the full job role list
	/**
	 * @param _req - The Express request object. Not used in this method.
	 * @param res - The Express response object.
	 * @param next - The next middleware function in the Express request-response cycle.
	 * Fetches all job roles from the service and sends them in the response.
	 * If an error occurs, it logs the error and passes it to the next middleware.
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
}
