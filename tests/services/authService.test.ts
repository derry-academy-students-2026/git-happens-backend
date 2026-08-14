import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/prismaClient.js", () => ({
	default: {
		user: {
			create: vi.fn(),
			findUnique: vi.fn(),
		},
	},
}));

import argon2 from "argon2";
import jwt from "jsonwebtoken";
import prisma from "../../src/prismaClient.js";
import {
	AuthConflictError,
	AuthService,
	AuthUnauthorizedError,
	AuthValidationError,
} from "../../src/services/authService.js";

const createUser = prisma.user.create as unknown as ReturnType<typeof vi.fn>;
const findUniqueUser = prisma.user.findUnique as unknown as ReturnType<
	typeof vi.fn
>;

describe("AuthService.registerUser", () => {
	beforeEach(() => {
		createUser.mockReset();
	});

	it("creates a user with normalized email, default role, and hashed password", async () => {
		createUser.mockResolvedValue({
			email: "test@example.com",
			role: { roleName: "user" },
			passwordHash: "ignored",
			createdAt: new Date("2026-08-13T00:00:00.000Z"),
		});

		const service = new AuthService();
		const result = await service.registerUser(
			"  TEST@Example.com  ",
			"GoodPass!9",
		);

		expect(createUser).toHaveBeenCalledTimes(1);
		const createArg = createUser.mock.calls[0][0];
		expect(createArg.data.email).toBe("test@example.com");
		expect(createArg.data.role).toEqual({ connect: { roleName: "user" } });
		expect(createArg.data.passwordHash).toBeTypeOf("string");
		expect(createArg.data.passwordHash).not.toBe("GoodPass!9");
		expect(result).toEqual({
			email: "test@example.com",
			role: "user",
			createdAt: new Date("2026-08-13T00:00:00.000Z"),
		});
	});

	it("throws validation error when email is invalid", async () => {
		const service = new AuthService();

		await expect(
			service.registerUser("invalid-email", "GoodPass!9"),
		).rejects.toBeInstanceOf(AuthValidationError);
		expect(createUser).not.toHaveBeenCalled();
	});

	it("throws validation error when password is shorter than 9 characters", async () => {
		const service = new AuthService();

		await expect(service.registerUser("a@b.com", "Aa!1234")).rejects.toThrow(
			"Password must be more than 8 characters long",
		);
		expect(createUser).not.toHaveBeenCalled();
	});

	it("throws validation error when password does not include required character types", async () => {
		const service = new AuthService();

		await expect(
			service.registerUser("a@b.com", "alllowercase9!"),
		).rejects.toThrow(
			"Password must include upper, lower, and special characters",
		);
		expect(createUser).not.toHaveBeenCalled();
	});

	it("throws conflict error for duplicate email", async () => {
		createUser.mockRejectedValue({ code: "P2002" });
		const service = new AuthService();

		await expect(
			service.registerUser("test@example.com", "GoodPass!9"),
		).rejects.toBeInstanceOf(AuthConflictError);
	});
});

describe("AuthService.loginUser", () => {
	const originalSecret = process.env.JWT_SECRET;

	beforeEach(() => {
		findUniqueUser.mockReset();
		process.env.JWT_SECRET = "test-secret";
	});

	afterEach(() => {
		if (originalSecret === undefined) {
			delete process.env.JWT_SECRET;
		} else {
			process.env.JWT_SECRET = originalSecret;
		}
	});

	async function seedMatchingUser(password: string) {
		findUniqueUser.mockResolvedValue({
			id: 7,
			email: "test@example.com",
			role: { roleName: "user" },
			passwordHash: await argon2.hash(password),
		});
	}

	it("returns a signed token when the password matches", async () => {
		await seedMatchingUser("GoodPass!9");
		const service = new AuthService();

		const result = await service.loginUser("  TEST@Example.com ", "GoodPass!9");

		expect(findUniqueUser).toHaveBeenCalledWith({
			where: { email: "test@example.com" },
			include: { role: true },
		});
		expect(result.email).toBe("test@example.com");
		expect(result.role).toBe("user");

		const payload = jwt.verify(result.token, "test-secret") as unknown as {
			sub: string;
			email: string;
			role: string;
			jti: string;
		};
		expect(payload.sub).toBe("7");
		expect(payload.email).toBe("test@example.com");
		expect(payload.role).toBe("user");
		expect(payload.jti).toBeTypeOf("string");
	});

	it("does not return the password hash to callers", async () => {
		await seedMatchingUser("GoodPass!9");
		const service = new AuthService();

		const result = await service.loginUser("test@example.com", "GoodPass!9");

		expect(Object.keys(result)).toEqual(["token", "email", "role"]);
	});

	it("throws unauthorized when the email is unknown", async () => {
		findUniqueUser.mockResolvedValue(null);
		const service = new AuthService();

		await expect(
			service.loginUser("missing@example.com", "GoodPass!9"),
		).rejects.toBeInstanceOf(AuthUnauthorizedError);
	});

	it("throws unauthorized when the password does not match", async () => {
		await seedMatchingUser("GoodPass!9");
		const service = new AuthService();

		await expect(
			service.loginUser("test@example.com", "WrongPass!9"),
		).rejects.toBeInstanceOf(AuthUnauthorizedError);
	});

	it("uses the same message for unknown email and wrong password", async () => {
		findUniqueUser.mockResolvedValue(null);
		const service = new AuthService();
		const unknownEmail = await service
			.loginUser("missing@example.com", "GoodPass!9")
			.catch((error: Error) => error.message);

		await seedMatchingUser("GoodPass!9");
		const wrongPassword = await service
			.loginUser("test@example.com", "WrongPass!9")
			.catch((error: Error) => error.message);

		expect(unknownEmail).toBe(wrongPassword);
	});

	it("does not apply registration password rules to login", async () => {
		await seedMatchingUser("weak");
		const service = new AuthService();

		await expect(
			service.loginUser("test@example.com", "weak"),
		).resolves.toBeDefined();
	});

	it("throws unauthorized when the stored hash is malformed", async () => {
		findUniqueUser.mockResolvedValue({
			id: 7,
			email: "test@example.com",
			role: { roleName: "user" },
			passwordHash: "not-a-valid-argon2-hash",
		});
		const service = new AuthService();

		await expect(
			service.loginUser("test@example.com", "GoodPass!9"),
		).rejects.toBeInstanceOf(AuthUnauthorizedError);
	});

	it("fails loudly when JWT_SECRET is not configured", async () => {
		await seedMatchingUser("GoodPass!9");
		delete process.env.JWT_SECRET;
		const service = new AuthService();

		await expect(
			service.loginUser("test@example.com", "GoodPass!9"),
		).rejects.toThrow("JWT_SECRET environment variable is not set");
	});
});
