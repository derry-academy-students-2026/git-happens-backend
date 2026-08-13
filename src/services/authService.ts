import argon2 from "argon2";
import prisma from "../prismaClient.js";
import {
	RegisterUserResponseModel,
} from "../models/authModels.js";

const MIN_PASSWORD_LENGTH = 9;
const DEFAULT_ROLE_NAME = "user";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/;

export class AuthValidationError extends Error {
	readonly statusCode = 400;
}

export class AuthConflictError extends Error {
	readonly statusCode = 409;
}

export class AuthService {
	/**
	 * Registers a new user with a default user role and an argon2-hashed password.
	 */
	async registerUser(
		email: string,
		password: string,
	): Promise<RegisterUserResponseModel> {
		const normalizedEmail = email.trim().toLowerCase();
		this.validateEmail(normalizedEmail);
		this.validatePassword(password);

		const passwordHash = await argon2.hash(password);

		try {
			const user = await prisma.user.create({
				data: {
					email: normalizedEmail,
					passwordHash,
					role: {
						connect: { roleName: DEFAULT_ROLE_NAME },
					},
				},
				include: {
					role: true,
				},
			});

			return new RegisterUserResponseModel(
				user.email,
				user.role.roleName,
				user.createdAt,
			);
		} catch (error: unknown) {
			if (
				typeof error === "object" &&
				error !== null &&
				"code" in error &&
				error.code === "P2002"
			) {
				throw new AuthConflictError("An account with this email already exists");
			}
			throw error;
		}
	}

	/**
	 * Validates email format for registration.
	 */
	private validateEmail(email: string): void {
		if (!EMAIL_REGEX.test(email)) {
			throw new AuthValidationError("Email must be a valid email format");
		}
	}

	/**
	 * Validates password complexity and minimum length.
	 */
	private validatePassword(password: string): void {
		if (password.length < MIN_PASSWORD_LENGTH) {
			throw new AuthValidationError(
				"Password must be more than 8 characters long",
			);
		}

		if (!PASSWORD_REGEX.test(password)) {
			throw new AuthValidationError(
				"Password must include upper, lower, and special characters",
			);
		}
	}
}

export const authService = new AuthService();
