import type { NextFunction, Request, Response } from "express";
import { capabilityService } from "../services/capabilityService.js";

export class CapabilitiesController {
    constructor(private service = capabilityService) {}

    async getCapabilities(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const capabilities = await this.service.getCapabilities();
            res.json(capabilities);
        } catch (error) {
            next(error);
        }
    }
}
