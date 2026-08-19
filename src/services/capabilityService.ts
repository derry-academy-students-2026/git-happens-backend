import { CapabilityResponseModel } from "../models/capabilityModels.js";
import prisma from "../prismaClient.js";

export class CapabilityService {
	async getCapabilities(): Promise<CapabilityResponseModel[]> {
		const capabilities = await prisma.capability.findMany({
			orderBy: { capabilityName: "asc" },
		});

		return capabilities.map(
			(capability) =>
				new CapabilityResponseModel(
					capability.capabilityId,
					capability.capabilityName,
				),
		);
	}
}

export const capabilityService = new CapabilityService();
