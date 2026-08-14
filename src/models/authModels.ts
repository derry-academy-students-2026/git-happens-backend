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

export class LoginUserResponseModel {
	constructor(
		public readonly token: string,
		public readonly email: string,
		public readonly role: string,
	) {}
}
