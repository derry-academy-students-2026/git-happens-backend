export class UserRequestModel {
	constructor(
		public readonly email: string,
		public readonly password: string,
	) {}
}

export class RegisterUserResponseModel {
	constructor(
		public readonly email: string,
		public readonly role: string,
		public readonly createdAt: Date,
	) {}
}
