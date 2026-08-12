export class RegisterUserRequestModel {
	constructor(
		public readonly email: string,
		public readonly password: string,
	) {}
}

export class RegisterUserResponseModel {
	constructor(
		public readonly id: number,
		public readonly email: string,
		public readonly role: string,
		public readonly createdAt: Date,
	) {}
}
