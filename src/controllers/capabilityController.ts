import type { NextFunction, Request, Response } from "express";
import { capabilityService } from "../services/capabilityService.js";

// handles GET /capabilities requests
export class CapabilitiesController {
    constructor(private service = capabilityService) {}

    /**
     * @param req - The Express request object.
     * @param res - The Express response object.
     * @param next - The next middleware function in the Express request-response cycle.    
     * Handles GET /capabilities requests.
     * Fetches all capabilities from the service and sends them in the response.
     * If an error occurs, it passes the error to the next middleware.
     */
    async getCapabilities(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const capabilities = await this.service.getCapabilities();
            res.json(capabilities);
        } catch (error) {
            next(error);
        }
    }
}
