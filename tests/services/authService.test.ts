import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/prismaClient.js", () => ({
	default: {
		user: {
			create: vi.fn(),
		},
	},
}));

import prisma from "../../src/prismaClient.js";
import {
	AuthConflictError,
	AuthService,
	AuthValidationError,
	hashPassword,
	verifyPassword,
} from "../../src/services/authService.js";

const createUser = prisma.user.create as unknown as ReturnType<typeof vi.fn>;

describe("hashPassword and verifyPassword", () => {
	it("hashes with a random salt and verifies correctly", async () => {
		const password = "StrongPass!123";
		const hash = await hashPassword(password);

		expect(hash).toContain("$argon2");
		expect(hash).not.toContain(password);
		expect(await verifyPassword(password, hash)).toBe(true);
		expect(await verifyPassword("WrongPass!123", hash)).toBe(false);
	});
});

describe("AuthService.registerUser", () => {
	beforeEach(() => {
		createUser.mockReset();
	});

	it("creates a user with normalized email and returns response model", async () => {
		createUser.mockResolvedValue({
			id: 7,
			email: "test@example.com",
			role: "user",
			passwordHash: "ignored",
			createdAt: new Date("2026-08-12T00:00:00.000Z"),
		});

		const service = new AuthService();
		const result = await service.registerUser("  TEST@Example.com  ", "GoodPass!9");

		expect(createUser).toHaveBeenCalledTimes(1);
		const createArg = createUser.mock.calls[0][0];
		expect(createArg.data.email).toBe("test@example.com");
		expect(createArg.data.role).toBeUndefined();
		expect(createArg.data.passwordHash).toBeTypeOf("string");
		expect(createArg.data.passwordHash).not.toBe("GoodPass!9");
		expect(result).toEqual({
			id: 7,
			email: "test@example.com",
			role: "user",
			createdAt: new Date("2026-08-12T00:00:00.000Z"),
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

		await expect(service.registerUser("a@b.com", "alllowercase9!")).rejects.toThrow(
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
