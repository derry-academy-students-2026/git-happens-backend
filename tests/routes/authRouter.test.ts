import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/services/authService.js", () => ({
	authService: { registerUser: vi.fn(), loginUser: vi.fn() },
	AuthService: class {},
	AuthValidationError: class AuthValidationError extends Error {
		readonly statusCode = 400;
	},
	AuthConflictError: class AuthConflictError extends Error {
		readonly statusCode = 409;
	},
	AuthUnauthorizedError: class AuthUnauthorizedError extends Error {
		readonly statusCode = 401;
	},
}));

import authRouter from "../../src/routes/authRouter.js";
import {
	AuthUnauthorizedError,
	authService,
} from "../../src/services/authService.js";

const registerUser = authService.registerUser as unknown as ReturnType<
	typeof vi.fn
>;
const loginUser = authService.loginUser as unknown as ReturnType<typeof vi.fn>;

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
		loginUser.mockReset();
	});

	it("POST /auth/register returns 201 and created user", async () => {
		const createdAt = new Date("2026-08-13T00:00:00.000Z");
		registerUser.mockResolvedValue({
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
			email: "user@example.com",
			role: "user",
			createdAt: createdAt.toISOString(),
		});
	});

	it("returns a generic 500 for unexpected service errors", async () => {
		registerUser.mockRejectedValue(new Error("boom"));

		const response = await request(createApp()).post("/auth/register").send({
			email: "user@example.com",
			password: "GoodPass!9",
		});

		expect(response.status).toBe(500);
		expect(response.body).toEqual({ message: "Internal server error" });
	});

	it("POST /auth/login returns 200 and a token", async () => {
		loginUser.mockResolvedValue({
			token: "signed.jwt.token",
			email: "user@example.com",
			role: "user",
		});

		const response = await request(createApp()).post("/auth/login").send({
			email: "user@example.com",
			password: "GoodPass!9",
		});

		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			token: "signed.jwt.token",
			email: "user@example.com",
			role: "user",
		});
	});

	it("POST /auth/login returns 401 for invalid credentials", async () => {
		loginUser.mockRejectedValue(
			new AuthUnauthorizedError("Invalid email or password"),
		);

		const response = await request(createApp()).post("/auth/login").send({
			email: "user@example.com",
			password: "wrong",
		});

		expect(response.status).toBe(401);
		expect(response.body).toEqual({ message: "Invalid email or password" });
	});
});
