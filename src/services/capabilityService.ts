import { CapabilityDao } from "../daos/capabilityDao.js";
import { mapCapabilityToResponseModel } from "../models/capabilityMapper.js";
import type { CapabilityResponseModel } from "../models/capabilityModels.js";

export class CapabilityService {
    private readonly capabilityDao: CapabilityDao;

    constructor(capabilityDao: CapabilityDao) {
        this.capabilityDao = capabilityDao;
    }

    async getCapabilities(): Promise<CapabilityResponseModel[]> {
        const rows = await this.capabilityDao.getCapabilities();
        return rows.map(mapCapabilityToResponseModel);
    }
}

const capabilityDao = new CapabilityDao();
export const capabilityService = new CapabilityService(capabilityDao);
