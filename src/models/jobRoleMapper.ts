import type { JobRoleGetPayload } from "../generated/prisma/models.js";
import { BandModel } from "./bandModels.js";
import { CapabilityModel } from "./capabilityModels.js";
import {
	JobRoleDetailedResponseModel,
	JobRoleModel,
	JobRoleResponseModel,
} from "./jobRoleModels.js";
import { StatusModel } from "./statusModel.js";
// input and output models established
//jobRoleModel is returned by the DAO
//JobRoleResponseModel interacts with API

// relations a job role query must include for mapPrismaJobRoleToModel to work
export const jobRoleInclude = {
	capability: true,
	band: true,
	status: true,
} as const;

type JobRoleRow = JobRoleGetPayload<{ include: typeof jobRoleInclude }>;

/**
 * Converts a Prisma job role row, with its capability, band and status
 * relations included, into a DAO-layer JobRoleModel.
 */
export function mapPrismaJobRoleToModel(jobRole: JobRoleRow): JobRoleModel {
	return new JobRoleModel(
		jobRole.jobRoleId,
		jobRole.roleName,
		jobRole.location,
		new CapabilityModel(
			jobRole.capability.capabilityId,
			jobRole.capability.capabilityName,
		),
		new BandModel(jobRole.band.bandId, jobRole.band.bandName),
		jobRole.closingDate,
		new StatusModel(jobRole.status.statusId, jobRole.status.statusName),
		jobRole.description,
		jobRole.responsibilities,
		jobRole.sharepointUrl,
		jobRole.numberOfOpenPositions,
	);
}

/**
 * Converts a DAO-layer JobRoleModel into the API-facing JobRoleResponseModel.
 */
export function mapJobRoleToResponseModel(
	jobRole: JobRoleModel,
): JobRoleResponseModel {
	return new JobRoleResponseModel(
		jobRole.jobRoleId,
		jobRole.roleName,
		jobRole.location,
		jobRole.capability,
		jobRole.band,
		jobRole.closingDate,
		jobRole.status,
	);
}

/**
 * Converts a DAO-layer JobRoleModel into the API-facing
 * JobRoleDetailedResponseModel, used by the single role detail view.
 */
export function mapJobRoleToDetailedResponseModel(
	jobRole: JobRoleModel,
): JobRoleDetailedResponseModel {
	return new JobRoleDetailedResponseModel(
		jobRole.jobRoleId,
		jobRole.roleName,
		jobRole.location,
		jobRole.capability,
		jobRole.band,
		jobRole.closingDate,
		jobRole.status,
		jobRole.description,
		jobRole.responsibilities,
		jobRole.sharepointUrl,
		jobRole.numberOfOpenPositions,
	);
}
