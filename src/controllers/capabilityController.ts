import type { NextFunction, Request, Response } from "express";
import type { CapabilityService } from "../services/capabilityService.js";

export class CapabilityController {
	constructor(private service: CapabilityService) {}

	async getCapabilities(
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			res.json(await this.service.getCapabilities());
		} catch (error) {
			next(error instanceof Error ? error : new Error(String(error)));
		}
	}
}
