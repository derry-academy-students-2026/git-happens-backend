import prisma from "../prismaClient.js";
import logger from "../lib/logger.js";
import { JobRoleModel } from "../models/jobRoleModels.js";
import { CapabilityModel } from "../models/capabilityModels.js";
import { BandModel } from "../models/bandModels.js";

export class JobRoleDao {
	// queries all job roles, along with their related capability and band, from the database
	async getJobRoles(): Promise<JobRoleModel[]> {
		const jobRoles = await prisma.jobRole.findMany({
			include: { capability: true, band: true },
		});
		logger.debug(`Queried ${jobRoles.length} job role(s) from the database`);

		return jobRoles.map(
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
	}
}
