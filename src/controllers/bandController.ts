import type { Request, Response } from "express";
import logger from "../lib/logger.js";
import type { BandService } from "../services/bandService.js";

/**
 * Controller class for handling band-related requests.
 * @param service - The band service instance used to fetch band data.
 */
export class BandController {
	constructor(private service: BandService) {}

	/**
	 * Fetches all bands from the service and sends them in the response.
	 * @param _req - The Express request object. Not used in this method.
	 * @param res - The Express response object.
	 */
	async getBands(_req: Request, res: Response): Promise<void> {
		try {
			const bands = await this.service.getBands();
			logger.debug(`Fetched ${bands.length} band(s)`);
			res.json(bands);
		} catch (error) {
			const err = error instanceof Error ? error : new Error(String(error));
			logger.error(`Failed to fetch bands: ${err.stack ?? err.message}`);
			res.status(500).json({ message: "Internal server error" });
		}
	}
}
