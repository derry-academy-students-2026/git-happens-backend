import type { NextFunction, Request, Response } from "express";
import logger from "../lib/logger.js";
import { capabilityService } from "../services/capabilityService.js";

/**
 * Controller class for handling capability-related requests.
 * @param service - The capability service instance used to fetch capability data.
 */
export class CapabilityController {
	constructor(private service = capabilityService) {}

	/**
	 * Fetches all capabilities from the service and sends them in the response.
	 * @param _req - The Express request object. Not used in this method.
	 * @param res - The Express response object.
	 * @param next - The next middleware function in the Express request-response cycle.
	 */
	async getCapabilities(
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const capabilities = await this.service.getCapabilities();
			logger.debug(`Fetched ${capabilities.length} capability/capabilities`);
			res.json(capabilities);
		} catch (error) {
			const err = error instanceof Error ? error : new Error(String(error));
			logger.error(`Failed to fetch capabilities: ${err.stack ?? err.message}`);
			next(err);
		}
	}
}
