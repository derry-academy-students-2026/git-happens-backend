import {
	ApplicationConflictError,
	ApplicationNotFoundError,
	ApplicationValidationError,
} from "../errors/applicationErrors.js";
import { ApplicationStatus } from "../generated/prisma/client.js";
import logger from "../lib/logger.js";
import type { ApplyForRoleRequestModel } from "../models/jobApplicationModels.js";
import {
	JobApplicationResponseModel,
	JobApplicationListResponseModel,
} from "../models/jobApplicationModels.js";
import prisma from "../prismaClient.js";

export class ApplicationService {
	/**
	 * Submits an application for an open job role with remaining positions.
	 * @param jobRoleId ID of the job role receiving the application.
	 * @param userId ID of the authenticated applicant.
	 * @param request Validated application details.
	 * @returns The created job application.
	 * @throws ApplicationValidationError when an ID is invalid.
	 * @throws ApplicationNotFoundError when the job role does not exist.
	 * @throws ApplicationConflictError when the role is unavailable or already applied for.
	 */
	async submitJobApplication(
		jobRoleId: number,
		userId: number,
		request: ApplyForRoleRequestModel,
	): Promise<JobApplicationResponseModel> {
		logger.info("Attempting job application submission", { jobRoleId, userId });

		if (!Number.isInteger(jobRoleId) || jobRoleId <= 0) {
			logger.warn("Rejected job application with invalid job role ID", {
				jobRoleId,
				userId,
			});
			throw new ApplicationValidationError(
				"Job role ID must be a positive integer",
			);
		}

		if (!Number.isInteger(userId) || userId <= 0) {
			logger.warn("Rejected job application with invalid user ID", { jobRoleId });
			throw new ApplicationValidationError("Invalid authenticated user");
		}

		const jobRole = await prisma.jobRole.findUnique({
			where: { jobRoleId },
			include: { status: true },
		});

		if (!jobRole) {
			logger.warn("Rejected job application for missing job role", {
				jobRoleId,
				userId,
			});
			throw new ApplicationNotFoundError("Job role not found");
		}

		const isOpen = jobRole.status.statusName.toLowerCase() === "open";
		if (!isOpen || jobRole.numberOfOpenPositions <= 0) {
			logger.warn("Rejected job application for unavailable job role", {
				jobRoleId,
				userId,
				status: jobRole.status.statusName,
				openPositions: jobRole.numberOfOpenPositions,
			});
			throw new ApplicationConflictError(
				"This role is not accepting applications",
			);
		}

		try {
			// This create will reject if the user has already applied for this
			// role due to the unique constraint on (jobRoleId, userId).
			const application = await prisma.jobApplication.create({
				data: {
					jobRoleId,
					userId,
					fullName: request.fullName,
					countryCode: request.countryCode,
					phoneNumber: request.phoneNumber,
					email: request.email,
					applicationText: request.applicationText,
					previousExperience:
						typeof request.previousExperience === "string" &&
						request.previousExperience.trim().length > 0
							? request.previousExperience
							: null,
					applicationStatus: ApplicationStatus.IN_PROGRESS,
				},
			});

			logger.info("Job application submitted", {
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
				logger.warn("Rejected duplicate job application", { jobRoleId, userId });
				throw new ApplicationConflictError(
					"You have already applied for this role",
				);
			}

			logger.error("Unexpected error while submitting job application", {
				jobRoleId,
				userId,
				error,
			});
			throw error;
		}
	}

	/**
	 * Lists a user's job applications, most recent first.
	 * @param userId ID of the applicant whose applications are requested.
	 * @returns The user's job applications, including the applied-for role's name and location.
	 * @throws ApplicationValidationError when the user ID is invalid.
	 */
	async getApplicationsByUserId(
		userId: number,
	): Promise<JobApplicationListResponseModel[]> {
		if (!Number.isInteger(userId) || userId <= 0) {
			logger.warn("Rejected job application list request with invalid user ID", {
				userId,
			});
			throw new ApplicationValidationError("Invalid authenticated user");
		}

		const applications = await prisma.jobApplication.findMany({
			where: { userId },
			include: { jobRole: true },
			orderBy: { createdAt: "desc" },
		});

		logger.debug("Queried job applications for user", {
			userId,
			count: applications.length,
		});

		return applications.map(
			(application) =>
				new JobApplicationListResponseModel(
					application.applicationId,
					application.jobRoleId,
					application.jobRole.roleName,
					application.jobRole.location,
					application.applicationStatus,
					application.createdAt,
				),
		);
	}
}
