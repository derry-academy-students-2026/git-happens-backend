import { JobRoleDao } from "../daos/jobRoleDao.js";
import { mapJobRoleToResponseModel } from "../models/jobRoleMapper.js";
import type { JobRoleResponseModel } from "../models/jobRoleModels.js";

export class JobRoleService {
    private readonly jobRoleDao: JobRoleDao;

    constructor(jobRoleDao: JobRoleDao) {
        this.jobRoleDao = jobRoleDao;
    }

    async getJobRoles(): Promise<JobRoleResponseModel[]> {
        const rows = await this.jobRoleDao.getJobRoles();
        return rows.map(mapJobRoleToResponseModel);

    }
} 


const jobRoleDao = new JobRoleDao();
export const jobRoleService = new JobRoleService(jobRoleDao);

