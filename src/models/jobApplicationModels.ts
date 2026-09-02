import type { ApplicationStatus } from "../generated/prisma/client.js";

export class ApplyForRoleRequestModel {
	constructor(
		public readonly fullName: string,
		public readonly countryCode: string,
		public readonly phoneNumber: string,
		public readonly email: string,
		public readonly applicationText: string,
		public readonly previousExperience?: string,
	) {}
}

export class JobApplicationResponseModel {
	constructor(
		public readonly applicationId: number,
		public readonly jobRoleId: number,
		public readonly userId: number,
		public readonly fullName: string,
		public readonly countryCode: string,
		public readonly phoneNumber: string,
		public readonly email: string,
		public readonly applicationText: string,
		public readonly previousExperience: string | null,
		public readonly applicationStatus: ApplicationStatus,
		public readonly createdAt: Date,
	) {}
}
