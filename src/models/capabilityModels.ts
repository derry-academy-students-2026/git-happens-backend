//creates DTOs

// capability as returned by the DAO layer
export class CapabilityModel {
	constructor(
		public readonly capabilityId: number,
		public readonly capabilityName: string,
	) {} // insert validation logic here
}

// capability as exposed to API consumers
export class CapabilityResponseModel {
	constructor(
		public readonly capabilityId: number,
		public readonly capabilityName: string,
	) {} // validation logic here
}
