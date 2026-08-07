import { JobRoleDao } from "../daos/jobRoleDao.js";
import type { JobRoleModel } from "../models/jobRoleModels.js";

export class JobRoleService {
    private readonly jobRoleDao: JobRoleDao;

    constructor(jobRoleDao: JobRoleDao) {
        this.jobRoleDao = jobRoleDao;
    }

    async getJobRoles(): Promise<JobRoleModel[]> {
        return this.jobRoleDao.getJobRoles();
    }
}

