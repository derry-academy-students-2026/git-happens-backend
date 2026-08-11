import type { NextFunction, Request, Response } from "express";
import { bandService } from "../services/bandService.js";

export class BandsController {
    constructor(private service = bandService) {}

    async getBands(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const bands = await this.service.getBands();
            res.json(bands);
        } catch (error) {
            next(error);
        }
    }
}
