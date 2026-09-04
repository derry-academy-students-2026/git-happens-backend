import type { Request, Response } from "express";
import logger from "../lib/logger.js";
import type { CapabilityService } from "../services/capabilityService.js";

export class CapabilityController {
	constructor(private service: CapabilityService) {}

	async getCapabilities(_req: Request, res: Response): Promise<void> {
		try {
			res.json(await this.service.getCapabilities());
		} catch (error) {
			const err = error instanceof Error ? error : new Error(String(error));
			logger.error(`Failed to fetch capabilities: ${err.stack ?? err.message}`);
			res.status(500).json({ message: "Internal server error" });
		}
	}
}
