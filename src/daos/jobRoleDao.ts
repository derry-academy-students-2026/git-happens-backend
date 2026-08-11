import prisma from "../prismaClient.js";
import type { JobRoleModel } from "../models/jobRoleModels.js";

export class JobRoleDao {
    async getJobRoles(): Promise<JobRoleModel[]> {
        const jobRoles = await prisma.jobRole.findMany();
        return jobRoles as JobRoleModel[];
    }
}