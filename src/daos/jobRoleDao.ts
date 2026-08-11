import prisma from "../prismaClient.js";
import { JobRoleModel } from "../models/jobRoleModels.js";
import { CapabilityModel } from "../models/capabilityModels.js";
import { BandModel } from "../models/bandModels.js";

export class JobRoleDao {
    async getJobRoles(): Promise<JobRoleModel[]> {
        const jobRoles = await prisma.jobRole.findMany({
            include: { capability: true, band: true },
        });

        return jobRoles.map(
            (jobRole) =>
                new JobRoleModel(
                    jobRole.jobRoleId,
                    jobRole.roleName,
                    jobRole.location,
                    new CapabilityModel(jobRole.capability.capabilityId, jobRole.capability.capabilityName),
                    new BandModel(jobRole.band.bandId, jobRole.band.bandName),
                    jobRole.closingDate,
                    jobRole.status
                )
        );
    }
}