import { JobRoleValidationError } from "../errors/customErrors.js";
import logger from "../lib/logger.js";
import {
	jobRoleInclude,
	mapJobRoleToDetailedResponseModel,
	mapJobRoleToResponseModel,
	mapPrismaJobRoleToModel,
} from "../models/jobRoleMapper.js";
import {
	PaginatedJobRolesResponseModel,
	type CreateJobRoleRequestModel,
	type JobRoleDetailedResponseModel,
} from "../models/jobRoleModels.js";
import prisma from "../prismaClient.js";

// number of job roles returned per page
export const JOB_ROLES_PAGE_SIZE = 10;
const PENDING_SHAREPOINT_URL =
	"https://sharepoint.example.com/job-roles/pending";

// Service class for handling job role-related operations.
export class JobRoleService {
	/**
	 * Fetches a page of job roles from the database, including their associated capabilities and bands.
	 * Maps the retrieved job roles to JobRoleResponseModel instances before returning them.
	 * @param page - The 1-based page number to fetch.
	 * @returns A promise that resolves to a page of JobRoleResponseModel instances along with pagination metadata.
	 */
	async getJobRoles(page: number): Promise<PaginatedJobRolesResponseModel> {
		const [jobRoles, totalCount] = await Promise.all([
			prisma.jobRole.findMany({
				include: jobRoleInclude,
				skip: (page - 1) * JOB_ROLES_PAGE_SIZE,
				take: JOB_ROLES_PAGE_SIZE,
			}),
			prisma.jobRole.count(),
		]);
		logger.debug(
			`Queried ${jobRoles.length} job role(s) from the database (page ${page})`,
		);

		return new PaginatedJobRolesResponseModel(
			jobRoles.map(mapPrismaJobRoleToModel).map(mapJobRoleToResponseModel),
			page,
			JOB_ROLES_PAGE_SIZE,
			totalCount,
			Math.ceil(totalCount / JOB_ROLES_PAGE_SIZE),
		);
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

	/** Creates an open job role linked to existing capability and band records. */
	async createJobRole(
		request: CreateJobRoleRequestModel,
	): Promise<JobRoleDetailedResponseModel> {
		const [capability, band, openStatus] = await Promise.all([
			prisma.capability.findUnique({
				where: { capabilityId: request.capabilityId },
			}),
			prisma.band.findUnique({ where: { bandId: request.bandId } }),
			prisma.status.findUnique({ where: { statusName: "Open" } }),
		]);

		if (!capability) {
			throw new JobRoleValidationError("Capability not found", 404);
		}
		if (!band) {
			throw new JobRoleValidationError("Band not found", 404);
		}
		if (!openStatus) {
			throw new Error('Required status "Open" is not configured');
		}

		const jobRole = await prisma.jobRole.create({
			data: {
				roleName: request.roleName,
				location: request.location,
				capabilityId: capability.capabilityId,
				bandId: band.bandId,
				closingDate: request.closingDate,
				description: request.description,
				responsibilities: request.responsibilities,
				// TODO: the sharepoint document is created out of band, so a placeholder
				// is stored until the real URL can be supplied on the request model.
				sharepointUrl: PENDING_SHAREPOINT_URL,
				statusId: openStatus.statusId,
				numberOfOpenPositions: request.numberOfOpenPositions,
			},
			include: jobRoleInclude,
		});

		logger.info(`Created job role ${jobRole.jobRoleId}`);
		return mapJobRoleToDetailedResponseModel(mapPrismaJobRoleToModel(jobRole));
	}
}
