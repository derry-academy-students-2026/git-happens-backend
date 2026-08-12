import type { NextFunction, Request, Response } from "express";
import { bandService } from "../services/bandService.js";

// handles GET /bands requests
export class BandsController {
    constructor(private service = bandService) {}
    /**
     * @param req - The Express request object.
     * @param res - The Express response object.
     * @param next - The next middleware function in the Express request-response cycle.
     * Fetches all bands from the service and sends them in the response.
     * If an error occurs, it passes the error to the next middleware.
     */
    async getBands(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const bands = await this.service.getBands();
            res.json(bands);
        } catch (error) {
            next(error);
        }
    }
}
