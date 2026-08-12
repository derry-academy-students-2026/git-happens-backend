import argon2 from "argon2";
import prisma from "../prismaClient.js";
import { RegisterUserResponseModel } from "../models/authModels.js";

const MIN_PASSWORD_LENGTH = 9;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/;

export class AuthValidationError extends Error {
	readonly statusCode = 400;
}

export class AuthConflictError extends Error {
	readonly statusCode = 409;
}

/**
 * Hashes a plaintext password using argon2id.
 */
export async function hashPassword(password: string): Promise<string> {
	return argon2.hash(password, { type: argon2.argon2id });
}

/**
 * Verifies a plaintext password against an argon2 hash.
 */
export async function verifyPassword(
	password: string,
	storedHash: string,
): Promise<boolean> {
	try {
		return await argon2.verify(storedHash, password);
	} catch {
		return false;
	}
}

/**
 * Creates new user accounts with validation, salted password hashing, and default role persistence.
 */
export class AuthService {
	/**
	 * Registers a new user account with validated credentials.
	 */
	async registerUser(
		email: string,
		password: string,
	): Promise<RegisterUserResponseModel> {
		const normalizedEmail = email.trim().toLowerCase();
		this.validateEmail(normalizedEmail);
		this.validatePassword(password);

		const passwordHash = await hashPassword(password);

		try {
			const user = await prisma.user.create({
				data: {
					email: normalizedEmail,
					passwordHash,
				},
			});

			return new RegisterUserResponseModel(
				user.id,
				user.email,
				user.role,
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
	 * Validates the email format before account creation.
	 */
	private validateEmail(email: string): void {
		if (!EMAIL_REGEX.test(email)) {
			throw new AuthValidationError("Email must be a valid email format");
		}
	}

	/**
	 * Validates password complexity and minimum length requirements.
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
