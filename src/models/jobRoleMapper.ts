import type { JobRoleModel, JobRoleResponseModel } from "./jobRoleModels.js";
// input and output models established
//jobRoleModel is returned by the DAO
//JobRoleResponseModel interacts with API

export function mapJobRoleToResponseModel(jobRole: JobRoleModel): JobRoleResponseModel {
    return {
        id: jobRole.id,
        title: jobRole.title,
        location: jobRole.location,
        job_code: jobRole.job_code
    }
}

// for reverse mapping for update function
export function mapJobRoleToModel(jobRole: JobRoleResponseModel): JobRoleModel {
    return {
        id: jobRole.id,
        title: jobRole.title,
        location: jobRole.location,
        job_code: jobRole.job_code
    };
}