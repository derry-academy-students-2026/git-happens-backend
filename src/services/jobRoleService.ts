import { mapJobRoleToResponseModel } from "../models/jobRoleMapper.js";
import type { JobRoleResponseModel } from "../models/jobRoleModels.js";
import logger from "../lib/logger.js";
import prisma from "../prismaClient.js";
import { JobRoleModel } from "../models/jobRoleModels.js";
import { CapabilityModel } from "../models/capabilityModels.js";
import { BandModel } from "../models/bandModels.js";

// Service class for handling job role-related operations.
export class JobRoleService {
	/**
	 * Fetches all job roles from the database, including their associated capabilities and bands.
	 * Maps the retrieved job roles to JobRoleResponseModel instances before returning them.
	 * @returns A promise that resolves to an array of JobRoleResponseModel instances.
	 */
	async getJobRoles(): Promise<JobRoleResponseModel[]> {
		const jobRoles = await prisma.jobRole.findMany({
			include: { capability: true, band: true },
		});
		logger.debug(`Queried ${jobRoles.length} job role(s) from the database`);

		const models = jobRoles.map(
			(jobRole) =>
				new JobRoleModel(
					jobRole.jobRoleId,
					jobRole.roleName,
					jobRole.location,
					new CapabilityModel(
						jobRole.capability.capabilityId,
						jobRole.capability.capabilityName,
					),
					new BandModel(jobRole.band.bandId, jobRole.band.bandName),
					jobRole.closingDate,
					jobRole.status,
				),
		);

		return models.map(mapJobRoleToResponseModel);
	}
}

export const jobRoleService = new JobRoleService();
