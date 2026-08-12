import argon2 from "argon2";
import jwt from "jsonwebtoken";
import type { LoginRequestDto } from "../dtos/authDto.js";
import prisma from "../prismaClient.js";

const LOGIN_ERROR = "Invalid email or password";

export class AuthError extends Error {
	public constructor(
		public readonly statusCode: number,
		message: string,
	) {
		super(message);
	}
}

export class AuthService {
	public async login(input: LoginRequestDto): Promise<string> {
		const user = await prisma.user.findUnique({
			where: { email: input.email },
		});

		if (!user) {
			throw new AuthError(401, LOGIN_ERROR);
		}

		const validPassword = await argon2.verify(user.passwordHash, input.password);

		if (!validPassword) {
			throw new AuthError(401, LOGIN_ERROR);
		}

		const secret = process.env.JWT_SECRET;

		if (!secret) {
			throw new Error("JWT_SECRET is not configured");
		}

		return jwt.sign({ userId: user.userId, email: user.email }, secret, {
			expiresIn: "1h",
		});
	}
}