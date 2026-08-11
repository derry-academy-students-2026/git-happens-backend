import type { NextFunction, Request, Response } from "express";
import logger from "../lib/logger.js";
import { jobRoleService } from "../services/jobRoleService.js";

export class JobRolesController {
	constructor(private service = jobRoleService) {}

	// handles GET /job-roles and GET /job-roles/:id, responding with the full job role list
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
			logger.error(`Failed to fetch job roles: ${error}`);
			next(error);
		}
	}
}
