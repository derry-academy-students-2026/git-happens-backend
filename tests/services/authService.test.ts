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
} from "../../src/services/authService.js";

const createUser = prisma.user.create as unknown as ReturnType<typeof vi.fn>;

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
		const result = await service.registerUser("  TEST@Example.com  ", "GoodPass!9");

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
