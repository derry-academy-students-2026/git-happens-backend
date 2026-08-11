import type { CapabilityModel } from "../models/capabilityModels.js";

export class CapabilityDao {
    async getCapabilities(): Promise<CapabilityModel[]> {
        //mock data
        return [
            {capabilityId: 1, capabilityName: "Python"},
            {capabilityId: 2, capabilityName: "JavaScript"},
            {capabilityId: 3, capabilityName: "TypeScript"},
            {capabilityId: 4, capabilityName: "React"},
            {capabilityId: 5, capabilityName: "Node.js"}
        ];
    }
}
