import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/services/authService.js", () => ({
	authService: { registerUser: vi.fn() },
	AuthService: class {},
	AuthValidationError: class AuthValidationError extends Error {
		readonly statusCode = 400;
	},
	AuthConflictError: class AuthConflictError extends Error {
		readonly statusCode = 409;
	},
}));

import authRouter from "../../src/routes/authRouter.js";
import { authService } from "../../src/services/authService.js";

const registerUser = authService.registerUser as unknown as ReturnType<
	typeof vi.fn
>;

function createApp() {
	const app = express();
	app.use(express.json());
	app.use("/auth", authRouter);
	app.use(
		(
			err: unknown,
			_req: express.Request,
			res: express.Response,
			_next: express.NextFunction,
		) => {
			res.status(500).json({ message: (err as Error).message });
		},
	);
	return app;
}

describe("authRouter", () => {
	beforeEach(() => {
		registerUser.mockReset();
	});

	it("POST /auth/register returns 201 and created user", async () => {
		const createdAt = new Date("2026-08-12T00:00:00.000Z");
		registerUser.mockResolvedValue({
			id: 11,
			email: "user@example.com",
			role: "user",
			createdAt,
		});

		const response = await request(createApp()).post("/auth/register").send({
			email: "user@example.com",
			password: "GoodPass!9",
		});

		expect(response.status).toBe(201);
		expect(response.body).toEqual({
			id: 11,
			email: "user@example.com",
			role: "user",
			createdAt: createdAt.toISOString(),
		});
	});

	it("forwards unexpected service errors to the error middleware", async () => {
		registerUser.mockRejectedValue(new Error("boom"));

		const response = await request(createApp()).post("/auth/register").send({
			email: "user@example.com",
			password: "GoodPass!9",
		});

		expect(response.status).toBe(500);
		expect(response.body).toEqual({ message: "boom" });
	});
});
