import type { NextFunction, Request, Response } from "express";
import logger from "../lib/logger.js";
import {
	JobRoleValidationError,
	jobRoleService,
} from "../services/jobRoleService.js";

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

	/** Validates and creates a new job role. */
	async createJobRole(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const body = req.body as Record<string, unknown> | undefined;
			const requestModel = {
				roleName: body?.roleName,
				location: body?.location,
				capabilityId: body?.capabilityId,
				bandId: body?.bandId,
				closingDate: body?.closingDate,
				description: body?.description,
				responsibilities: body?.responsibilities,
				numberOfOpenPositions: body?.numberOfOpenPositions,
			};

			const textFields = [
				requestModel.roleName,
				requestModel.location,
				requestModel.description,
				requestModel.responsibilities,
			];
			if (
				textFields.some(
					(value) => typeof value !== "string" || value.trim().length === 0,
				) ||
				typeof requestModel.capabilityId !== "number" ||
				typeof requestModel.bandId !== "number" ||
				!Number.isInteger(requestModel.capabilityId) ||
				!Number.isInteger(requestModel.bandId) ||
				requestModel.capabilityId <= 0 ||
				requestModel.bandId <= 0 ||
				typeof requestModel.numberOfOpenPositions !== "number" ||
				!Number.isInteger(requestModel.numberOfOpenPositions) ||
				requestModel.numberOfOpenPositions <= 0 ||
				typeof requestModel.closingDate !== "string" ||
				Number.isNaN(Date.parse(requestModel.closingDate))
			) {
				res.status(400).json({ message: "Invalid job role details" });
				return;
			}

			const closingDate = new Date(requestModel.closingDate);
			if (closingDate.getTime() <= Date.now()) {
				logger.warn(
					`Rejected job role with closing date in the past: ${requestModel.closingDate}`,
				);
				res.status(400).json({ message: "Closing date must be in the future" });
				return;
			}

			const roleName = requestModel.roleName as string;
			const location = requestModel.location as string;
			const description = requestModel.description as string;
			const responsibilities = requestModel.responsibilities as string;

			const jobRole = await this.service.createJobRole({
				roleName: roleName.trim(),
				location: location.trim(),
				capabilityId: requestModel.capabilityId,
				bandId: requestModel.bandId,
				closingDate,
				description: description.trim(),
				responsibilities: responsibilities.trim(),
				numberOfOpenPositions: requestModel.numberOfOpenPositions,
			});
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
