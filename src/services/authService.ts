import argon2 from "argon2";
import { randomUUID } from "node:crypto";
import type { SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import logger from "../lib/logger.js";
import { maskEmail } from "../lib/maskEmail.js";
import {
	LoginUserResponseModel,
	RegisterUserResponseModel,
} from "../models/authModels.js";
import prisma from "../prismaClient.js";

const MIN_PASSWORD_LENGTH = 9;
const DEFAULT_ROLE_NAME = "user";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/;
const TOKEN_EXPIRY: SignOptions["expiresIn"] = "1h";

export class AuthValidationError extends Error {
	readonly statusCode = 400;
}

export class AuthConflictError extends Error {
	readonly statusCode = 409;
}

export class AuthUnauthorizedError extends Error {
	readonly statusCode = 401;
}

export class AuthService {
	/**
	 * Registers a new user with a default user role and an argon2-hashed password.
	 * @param email The user's email address.
	 * @param password The user's password.
	 * @returns A RegisterUserResponseModel containing the created user's email, role, and creation timestamp.
	 * @throws AuthValidationError if the email or password is invalid.
	 * @throws AuthConflictError if a user with the same email already exists.
	 */
	async registerUser(
		email: string,
		password: string,
	): Promise<RegisterUserResponseModel> {
		const normalizedEmail = email.trim().toLowerCase();
		logger.info("Registering user", { email: maskEmail(normalizedEmail) });
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
				throw new AuthConflictError(
					"An account with this email already exists",
				);
			}

			logger.error("User registration failed with unexpected error", {
				email: maskEmail(normalizedEmail),
				error,
			});
			throw error;
		}
	}

	/**
	 * Authenticates a user by email and password and issues a signed JWT.
	 * @param email The user's email address.
	 * @param password The user's password.
	 * @returns A LoginUserResponseModel containing the JWT and the user's email.
	 * @throws AuthUnauthorizedError if the email does not exist or the password is incorrect.
	 */
	async loginUser(
		email: string,
		password: string,
	): Promise<LoginUserResponseModel> {
		const normalizedEmail = email.trim().toLowerCase();
		logger.info("Attempting user login", {
			email: maskEmail(normalizedEmail),
		});

		const user = await prisma.user.findUnique({
			where: { email: normalizedEmail },
			include: { role: true },
		});

		// One error for both unknown email and wrong password, so the response
		// cannot be used to discover which accounts exist.
		if (!user || !(await this.verifyPassword(user.passwordHash, password))) {
			logger.warn("Login denied due to invalid credentials", {
				email: maskEmail(normalizedEmail),
			});
			throw new AuthUnauthorizedError("Invalid email or password");
		}

		const token = jwt.sign(
			{
				sub: String(user.id),
				email: user.email,
				role: user.role.roleName,
				jti: randomUUID(),
			},
			this.getJwtSecret(),
			{ expiresIn: TOKEN_EXPIRY },
		);

		logger.info("Login succeeded", {
			email: maskEmail(user.email),
			role: user.role.roleName,
		});

		return new LoginUserResponseModel(token, user.email, user.role.roleName);
	}

	/**
	 * argon2 stores its salt and cost parameters inside the hash, so the
	 * submitted password is verified against it rather than re-hashed.
	 * @param passwordHash The stored argon2 hash of the user's password.
	 * @param password The submitted password to verify.
	 * @returns True if the password matches the hash; false otherwise.
	 * @throws Any errors thrown by argon2.verify, except for malformed hashes which return false.
	 */
	private async verifyPassword(
		passwordHash: string,
		password: string,
	): Promise<boolean> {
		try {
			return await argon2.verify(passwordHash, password);
		} catch {
			logger.warn("Password verification failed due to malformed hash");
			// Thrown when the stored hash is malformed; treat as a failed login.
			return false;
		}
	}

	/**
	 * Retrieves the JWT secret from the environment variables.
	 * @returns The JWT secret.
	 * @throws Error if the JWT_SECRET environment variable is not set.
	 */
	private getJwtSecret(): string {
		const secret = process.env.JWT_SECRET;
		if (!secret) {
			logger.error("JWT_SECRET environment variable is not set");
			throw new Error("JWT_SECRET environment variable is not set");
		}
		return secret;
	}

	/**
	 * Validates email format for registration.
	 * @param email The email address to validate.
	 * @throws AuthValidationError if the email format is invalid.
	 */
	private validateEmail(email: string): void {
		if (!EMAIL_REGEX.test(email)) {
			throw new AuthValidationError("Email must be a valid email format");
		}
	}

	/**
	 * Validates password complexity and minimum length.
	 * @param password The password to validate.
	 * @throws AuthValidationError if the password does not meet complexity or length requirements.
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
