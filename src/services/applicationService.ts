import {
	ApplicationConflictError,
	ApplicationNotFoundError,
	ApplicationValidationError,
} from "../errors/applicationErrors.js";
import { ApplicationStatus } from "../generated/prisma/client.js";
import logger from "../lib/logger.js";
import type { ApplyForRoleRequestModel } from "../models/jobApplicationModels.js";
import { JobApplicationResponseModel } from "../models/jobApplicationModels.js";
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
			throw new ApplicationValidationError(
				"Job role ID must be a positive integer",
			);
		}

		if (!Number.isInteger(userId) || userId <= 0) {
			throw new ApplicationValidationError("Invalid authenticated user");
		}

		const jobRole = await prisma.jobRole.findUnique({
			where: { jobRoleId },
			include: { status: true },
		});

		if (!jobRole) {
			throw new ApplicationNotFoundError("Job role not found");
		}

		const isOpen = jobRole.status.statusName.toLowerCase() === "open";
		if (!isOpen || jobRole.numberOfOpenPositions <= 0) {
			throw new ApplicationConflictError(
				"This role is not accepting applications",
			);
		}

		try {
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
					applicationStatus: ApplicationStatus.SUBMITTED,
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
}
