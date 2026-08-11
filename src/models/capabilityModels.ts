//creates DTOs

export class CapabilityModel {
    constructor(
        public readonly capabilityId: number,
        public readonly capabilityName: string
    ) {} // insert validation logic here
}

export class CapabilityResponseModel {
    constructor(
        public readonly capabilityId: number,
        public readonly capabilityName: string
    ) {} // validation logic here
}

