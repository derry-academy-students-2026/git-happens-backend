import { BandDao } from "../daos/bandDao.js";
import { mapBandToResponseModel } from "../models/bandMapper.js";
import type { BandResponseModel } from "../models/bandModels.js";

export class BandService {
    private readonly bandDao: BandDao;

    constructor(bandDao: BandDao) {
        this.bandDao = bandDao;
    }

    async getBands(): Promise<BandResponseModel[]> {
        const rows = await this.bandDao.getBands();
        return rows.map(mapBandToResponseModel);
    }
}

const bandDao = new BandDao();
export const bandService = new BandService(bandDao);
