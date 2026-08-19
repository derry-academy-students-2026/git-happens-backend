import type { NextFunction, Request, Response } from "express";
import { capabilityService } from "../services/capabilityService.js";

export class CapabilityController {
	constructor(private service = capabilityService) {}

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
