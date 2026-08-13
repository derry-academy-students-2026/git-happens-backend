import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { AuthController } from "../../src/controllers/authController.js";
import {
	AuthConflictError,
	AuthValidationError,
} from "../../src/services/authService.js";
import type { AuthService } from "../../src/services/authService.js";

function createFakeService(
	registerUser: ReturnType<typeof vi.fn>,
): AuthService {
	return { registerUser } as unknown as AuthService;
}

function createMockResponse(): Response {
	return {
		json: vi.fn(),
		status: vi.fn().mockReturnThis(),
	} as unknown as Response;
}

describe("AuthController.register", () => {
	it("returns 201 and user payload on successful registration", async () => {
		const createdAt = new Date("2026-08-13T00:00:00.000Z");
		const service = createFakeService(
			vi.fn().mockResolvedValue({
				email: "test@example.com",
				role: "user",
				createdAt,
			}),
		);
		const controller = new AuthController(service);
		const res = createMockResponse();
		const next = vi.fn() as unknown as NextFunction;

		await controller.register(
			{ body: { email: "test@example.com", password: "GoodPass!9" } } as Request,
			res,
			next,
		);

		expect(res.status).toHaveBeenCalledWith(201);
		expect(res.json).toHaveBeenCalledWith({
			email: "test@example.com",
			role: "user",
			createdAt,
		});
		expect(next).not.toHaveBeenCalled();
	});

	it("returns 400 on validation errors", async () => {
		const service = createFakeService(
			vi.fn().mockRejectedValue(
				new AuthValidationError("Email must be a valid email format"),
			),
		);
		const controller = new AuthController(service);
		const res = createMockResponse();
		const next = vi.fn() as unknown as NextFunction;

		await controller.register(
			{ body: { email: "bad", password: "GoodPass!9" } } as Request,
			res,
			next,
		);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({
			message: "Email must be a valid email format",
		});
		expect(next).not.toHaveBeenCalled();
	});

	it("returns 409 on duplicate email", async () => {
		const service = createFakeService(
			vi.fn().mockRejectedValue(
				new AuthConflictError("An account with this email already exists"),
			),
		);
		const controller = new AuthController(service);
		const res = createMockResponse();
		const next = vi.fn() as unknown as NextFunction;

		await controller.register(
			{ body: { email: "test@example.com", password: "GoodPass!9" } } as Request,
			res,
			next,
		);

		expect(res.status).toHaveBeenCalledWith(409);
		expect(res.json).toHaveBeenCalledWith({
			message: "An account with this email already exists",
		});
		expect(next).not.toHaveBeenCalled();
	});

	it("forwards unexpected errors to middleware", async () => {
		const service = createFakeService(
			vi.fn().mockRejectedValue(new Error("unexpected")),
		);
		const controller = new AuthController(service);
		const res = createMockResponse();
		const next = vi.fn() as unknown as NextFunction;

		await controller.register(
			{ body: { email: "test@example.com", password: "GoodPass!9" } } as Request,
			res,
			next,
		);

		expect(next).toHaveBeenCalled();
		expect(res.status).not.toHaveBeenCalled();
	});
});
