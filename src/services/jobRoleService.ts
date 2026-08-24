import { JobRoleValidationError } from "../errors/customErrors.js";
import logger from "../lib/logger.js";
import { JobApplicationResponseModel } from "../models/jobApplicationModels.js";
import {
	jobRoleInclude,
	mapJobRoleToDetailedResponseModel,
	mapJobRoleToResponseModel,
	mapPrismaJobRoleToModel,
} from "../models/jobRoleMapper.js";
import type {
	CreateJobRoleRequestModel,
	JobRoleDetailedResponseModel,
	JobRoleResponseModel,
} from "../models/jobRoleModels.js";
import prisma from "../prismaClient.js";

const PENDING_SHAREPOINT_URL =
	"https://sharepoint.example.com/job-roles/pending";

export class JobRoleNotFoundError extends Error {
	readonly statusCode = 404;
}

export class JobRoleApplicationConflictError extends Error {
	readonly statusCode = 409;
}

export class JobRoleApplicationValidationError extends Error {
	readonly statusCode = 400;
}

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

	/**
	 * Creates an application for a job role when role status is open and positions remain.
	 * @param jobRoleId - The ID of the role being applied for.
	 * @param userId - The authenticated user ID.
	 * @param fullName - Applicant full name.
	 * @param countryCode - Applicant phone country dial code including plus prefix.
	 * @param phoneNumber - Applicant phone number.
	 * @param email - Applicant contact email.
	 * @param applicationText - Applicant free-text application content.
	 * @param previousExperience - Optional previous experience summary.
	 * @returns A persisted JobApplicationResponseModel with in-progress status.
	 * @throws JobRoleApplicationValidationError for invalid IDs.
	 * @throws JobRoleNotFoundError when the target role does not exist.
	 * @throws JobRoleApplicationConflictError when role is closed/full or already applied.
	 */
	async applyForRole(
		jobRoleId: number,
		userId: number,
		fullName: string,
		countryCode: string,
		phoneNumber: string,
		email: string,
		applicationText: string,
		previousExperience?: string,
	): Promise<JobApplicationResponseModel> {
		logger.info("Attempting role application", { jobRoleId, userId });

		if (!Number.isInteger(jobRoleId) || jobRoleId <= 0) {
			logger.warn("Rejected role application due to invalid role ID", {
				jobRoleId,
				userId,
			});
			throw new JobRoleApplicationValidationError(
				"Job role ID must be a positive integer",
			);
		}

		if (!Number.isInteger(userId) || userId <= 0) {
			logger.warn("Rejected role application due to invalid user ID", {
				jobRoleId,
				userId,
			});
			throw new JobRoleApplicationValidationError("Invalid authenticated user");
		}

		const jobRole = await prisma.jobRole.findUnique({
			where: { jobRoleId },
			include: { status: true },
		});

		if (!jobRole) {
			logger.info("Role application rejected because role was not found", {
				jobRoleId,
				userId,
			});
			throw new JobRoleNotFoundError("Job role not found");
		}

		const isOpen = jobRole.status.statusName.toLowerCase() === "open";
		if (!isOpen || jobRole.numberOfOpenPositions <= 0) {
			logger.info("Role application rejected because role is not open", {
				jobRoleId,
				userId,
				status: jobRole.status.statusName,
				numberOfOpenPositions: jobRole.numberOfOpenPositions,
			});
			throw new JobRoleApplicationConflictError(
				"This role is not accepting applications",
			);
		}

		try {
			// This create will reject if the user has already applied
			// for this role due to the unique constraint on (jobRoleId, userId)
			const application = await prisma.jobApplication.create({
				data: {
					jobRoleId,
					userId,
					fullName,
					countryCode,
					phoneNumber,
					email,
					applicationText,
					previousExperience:
						typeof previousExperience === "string" &&
						previousExperience.trim().length > 0
							? previousExperience
							: null,
					applicationStatus: "in progress",
				},
			});

			logger.info("Role application created", {
				applicationId: application.applicationId,
				jobRoleId,
				userId,
			});

			return new JobApplicationResponseModel(
				application.applicationId,
				application.jobRoleId,
				application.userId,
				application.fullName,
				application.countryCode,
				application.phoneNumber,
				application.email,
				application.applicationText,
				application.previousExperience,
				application.applicationStatus,
				application.createdAt,
			);
		} catch (error: unknown) {
			if (
				typeof error === "object" &&
				error !== null &&
				"code" in error &&
				error.code === "P2002"
			) {
				logger.info("Role application rejected due to duplicate submission", {
					jobRoleId,
					userId,
				});
				throw new JobRoleApplicationConflictError(
					"You have already applied for this role",
				);
			}

			logger.error("Unexpected error while creating role application", {
				jobRoleId,
				userId,
				error,
			});

			throw error;
		}
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
