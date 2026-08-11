import prisma from "../prismaClient.js";
import type { BandModel } from "../models/bandModels.js";

export class BandDao {
    async getBands(): Promise<BandModel[]> {
        const bands = await prisma.band.findMany();
        return bands as BandModel[];
    }
}
