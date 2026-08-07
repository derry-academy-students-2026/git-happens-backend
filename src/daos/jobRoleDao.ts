import type { JobRoleModel } from "../models/jobRoleModels.js";

export class JobRoleDao {
    async getJobRoles(): Promise<JobRoleModel[]> {
        //mock data
        return [
            {id: "1", title: "Software Engineer", location: "New York", job_code: "SE001"},
            {id: "2", title: "Data Scientist", location: "San Francisco", job_code: "DS001"},
            {id: "3", title: "Product Manager", location: "London", job_code: "PM001"}
        ];
    }
}