import { JobRoleModel, JobRoleResponseModel } from "./jobRoleModels.js";
// input and output models established
//jobRoleModel is returned by the DAO
//JobRoleResponseModel interacts with API

<<<<<<< HEAD
// converts a DAO-layer JobRoleModel into the API-facing JobRoleResponseModel
=======
/**
 * Converts a DAO-layer JobRoleModel into the API-facing JobRoleResponseModel.
 */
>>>>>>> origin/main
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

<<<<<<< HEAD
// converts an API-facing JobRoleResponseModel back into the DAO-layer JobRoleModel, for update operations
export function mapJobRoleToModel(jobRole: JobRoleResponseModel): JobRoleModel {
	return {
		jobRoleId: jobRole.jobRoleId,
		roleName: jobRole.roleName,
		location: jobRole.location,
		capability: jobRole.capability,
		band: jobRole.band,
		closingDate: jobRole.closingDate,
		status: jobRole.status,
	};
=======
/**
 * Converts an API-facing JobRoleResponseModel back into the DAO-layer
 * JobRoleModel, for update operations.
 */
export function mapJobRoleToModel(jobRole: JobRoleResponseModel): JobRoleModel {
	return new JobRoleModel(
		jobRole.jobRoleId,
		jobRole.roleName,
		jobRole.location,
		jobRole.capability,
		jobRole.band,
		jobRole.closingDate,
		jobRole.status,
	);
>>>>>>> origin/main
}
