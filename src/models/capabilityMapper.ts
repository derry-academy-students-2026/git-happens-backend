import type { CapabilityModel, CapabilityResponseModel } from "./capabilityModels.js";

export function mapCapabilityToResponseModel(capability: CapabilityModel): CapabilityResponseModel {
    return {
        capabilityId: capability.capabilityId,
        capabilityName: capability.capabilityName
    };
}

export function mapCapabilityToModel(capability: CapabilityResponseModel): CapabilityModel {
    return {
        capabilityId: capability.capabilityId,
        capabilityName: capability.capabilityName
    };
}
