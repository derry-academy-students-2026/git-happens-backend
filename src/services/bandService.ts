import { BandResponseModel } from "../models/bandModels.js";
import prisma from "../prismaClient.js";

export class BandService {
	async getBands(): Promise<BandResponseModel[]> {
		const bands = await prisma.band.findMany({
			orderBy: { bandName: "asc" },
		});

		return bands.map(
			(band) => new BandResponseModel(band.bandId, band.bandName),
		);
	}
}

export const bandService = new BandService();
