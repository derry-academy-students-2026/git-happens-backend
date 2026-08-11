import type { JobRoleModel, JobRoleResponseModel } from "./jobRoleModels.js";
// input and output models established
//jobRoleModel is returned by the DAO
//JobRoleResponseModel interacts with API

export function mapJobRoleToResponseModel(jobRole: JobRoleModel): JobRoleResponseModel {
    return {
        jobRoleId: jobRole.jobRoleId,
        roleName: jobRole.roleName,
        location: jobRole.location,
        capabilityId: jobRole.capabilityId,
        bandId: jobRole.bandId,
        closingDate: jobRole.closingDate,
        status: jobRole.status
    }
}

// for reverse mapping for update function
export function mapJobRoleToModel(jobRole: JobRoleResponseModel): JobRoleModel {
    return {
        jobRoleId: jobRole.jobRoleId,
        roleName: jobRole.roleName,
        location: jobRole.location,
        capabilityId: jobRole.capabilityId,
        bandId: jobRole.bandId,
        closingDate: jobRole.closingDate,
        status: jobRole.status
    };
}