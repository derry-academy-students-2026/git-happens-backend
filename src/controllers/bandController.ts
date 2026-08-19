import type { NextFunction, Request, Response } from "express";
import { bandService } from "../services/bandService.js";

export class BandController {
	constructor(private service = bandService) {}

	async getBands(
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			res.json(await this.service.getBands());
		} catch (error) {
			next(error instanceof Error ? error : new Error(String(error)));
		}
	}
}
