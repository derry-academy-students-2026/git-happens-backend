import type { JobRoleModel } from "../models/jobRoleModels.js";

export class JobRoleDao {
    async getJobRoles(): Promise<JobRoleModel[]> {
        //mock data
        return [
            {jobRoleId: 1, roleName: "Software Engineer", location: "New York", capabilityId: "SE001", bandId: 50000, closingDate: new Date(), status: new Date()},
            {jobRoleId: 2, roleName: "Data Scientist", location: "San Francisco", capabilityId: "DS001", bandId: 60000, closingDate: new Date(), status: new Date()},
            {jobRoleId: 3, roleName: "Product Manager", location: "London", capabilityId: "PM001", bandId: 55000, closingDate: new Date(), status: new Date()}
        ];
    }
}