import prisma from "../prismaClient.js";
import type { CapabilityModel } from "../models/capabilityModels.js";

export class CapabilityDao {
    async getCapabilities(): Promise<CapabilityModel[]> {
        const capabilities = await prisma.capability.findMany();
        return capabilities as CapabilityModel[];
    }
}
