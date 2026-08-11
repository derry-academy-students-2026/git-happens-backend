//creates DTOs
import type { CapabilityModel } from './capabilityModels.ts';
import type { BandModel } from './bandModels.ts';

export class JobRoleModel {
    constructor(
        public readonly jobRoleId: number,
        public readonly roleName: string,
        public readonly location: string,
        public readonly capabilityId: string,
        public readonly capability: CapabilityModel,
        public readonly bandId: number,
        public readonly band: BandModel,
        public readonly closingDate: Date,
        public readonly status: Date
    ) {} // insert validation logic here
}

export class JobRoleResponseModel {
    constructor (
        public readonly jobRoleId: number,
        public readonly roleName: string,
        public readonly location: string,
        public readonly capabilityId: string,
        public readonly capability: CapabilityModel,
        public readonly bandId: number,
        public readonly band: BandModel,
        public readonly closingDate: Date,
        public readonly status: Date
    ) {} // validation logic here
}