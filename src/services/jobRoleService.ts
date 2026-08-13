import logger from "../lib/logger.js";
import {
	jobRoleInclude,
	mapJobRoleToDetailedResponseModel,
	mapJobRoleToResponseModel,
	mapPrismaJobRoleToModel,
} from "../models/jobRoleMapper.js";
import type {
	JobRoleDetailedResponseModel,
	JobRoleResponseModel,
} from "../models/jobRoleModels.js";
import prisma from "../prismaClient.js";

// Service class for handling job role-related operations.
export class JobRoleService {
	/**
	 * Fetches all job roles from the database, including their associated capabilities and bands.
	 * Maps the retrieved job roles to JobRoleResponseModel instances before returning them.
	 * @returns A promise that resolves to an array of JobRoleResponseModel instances.
	 */
	async getJobRoles(): Promise<JobRoleResponseModel[]> {
		const jobRoles = await prisma.jobRole.findMany({
			include: jobRoleInclude,
		});
		logger.debug(`Queried ${jobRoles.length} job role(s) from the database`);

		return jobRoles.map(mapPrismaJobRoleToModel).map(mapJobRoleToResponseModel);
	}

	/**
	 * Fetches a single job role by its ID, including its capability, band and status.
	 * @param jobRoleId - The ID of the job role to fetch.
	 * @returns A promise resolving to the matching JobRoleDetailedResponseModel,
	 * or null if no job role has that ID.
	 */
	async getJobRoleById(
		jobRoleId: number,
	): Promise<JobRoleDetailedResponseModel | null> {
		const jobRole = await prisma.jobRole.findUnique({
			where: { jobRoleId },
			include: jobRoleInclude,
		});

		if (!jobRole) {
			logger.debug(`No job role found with ID ${jobRoleId}`);
			return null;
		}

		logger.debug(`Queried job role ${jobRoleId} from the database`);
		return mapJobRoleToDetailedResponseModel(mapPrismaJobRoleToModel(jobRole));
	}
}

export const jobRoleService = new JobRoleService();
