import type { NextFunction, Request, Response } from "express";
import {jobRoleService} from "../services/jobRoleService.js";

export class JobRolesController {
    constructor(private service = jobRoleService) {}

    async getJobRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
        
        try {
            const jobRoles = await this.service.getJobRoles();
            res.json(jobRoles);
        } catch (error) {
            next(error);
        }
    }
}