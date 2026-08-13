//creates DTOs

import type { BandModel } from "./bandModels.js";
import type { CapabilityModel } from "./capabilityModels.js";
import type { StatusModel } from "./statusModel.js";

// job role as returned by the DAO layer
export class JobRoleModel {
	constructor(
		public readonly jobRoleId: number,
		public readonly roleName: string,
		public readonly location: string,
		public readonly capability: CapabilityModel,
		public readonly band: BandModel,
		public readonly closingDate: Date,
		public readonly status: StatusModel,
		public readonly description: string,
		public readonly responsibilities: string,
		public readonly sharepointUrl: string,
		public readonly numberOfOpenPositions: number,
	) {} // insert validation logic here
}

// job role as exposed to API consumers in list views
export class JobRoleResponseModel {
	constructor(
		public readonly jobRoleId: number,
		public readonly roleName: string,
		public readonly location: string,
		public readonly capability: CapabilityModel,
		public readonly band: BandModel,
		public readonly closingDate: Date,
		public readonly status: StatusModel,
	) {} // validation logic here
}

// job role as exposed to API consumers on the single role detail view
export class JobRoleDetailedResponseModel {
	constructor(
		public readonly jobRoleId: number,
		public readonly roleName: string,
		public readonly location: string,
		public readonly capability: CapabilityModel,
		public readonly band: BandModel,
		public readonly closingDate: Date,
		public readonly status: StatusModel,
		public readonly description: string,
		public readonly responsibilities: string,
		public readonly sharepointUrl: string,
		public readonly numberOfOpenPositions: number,
	) {} // validation logic here
}
