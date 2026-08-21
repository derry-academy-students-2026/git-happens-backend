import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
	authenticateToken,
	authorizeRecruitmentAccess,
} from "../../src/middleware/auth.js";

function createProtectedApp() {
	const app = express();
	app.use(authenticateToken);
	app.use(authorizeRecruitmentAccess);

	app.get("/resource", (_req, res) => {
		res.status(200).json({ ok: true });
	});

	app.post("/resource", (_req, res) => {
		res.status(200).json({ ok: true });
	});

	return app;
}

function createToken(role: string): string {
	return jwt.sign(
		{ sub: "1", email: "user@example.com", role, jti: `${role}-jti` },
		"test-secret",
		{ expiresIn: "1h" },
	);
}

describe("auth middleware", () => {
	const originalSecret = process.env.JWT_SECRET;

	beforeEach(() => {
		process.env.JWT_SECRET = "test-secret";
	});

	afterEach(() => {
		if (originalSecret === undefined) {
			delete process.env.JWT_SECRET;
			return;
		}

		process.env.JWT_SECRET = originalSecret;
	});

	it("returns 401 JSON when no token is sent to API clients", async () => {
		const response = await request(createProtectedApp()).get("/resource");

		expect(response.status).toBe(401);
		expect(response.body).toEqual({
			message: "Authentication required",
			redirectTo: "/login",
		});
	});

	it("redirects browser clients to login when no token is sent", async () => {
		const response = await request(createProtectedApp())
			.get("/resource")
			.set("Accept", "text/html");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/login");
	});

	it("allows users to read list/info endpoints", async () => {
		const response = await request(createProtectedApp())
			.get("/resource")
			.set("Authorization", `Bearer ${createToken("user")}`);

		expect(response.status).toBe(200);
		expect(response.body).toEqual({ ok: true });
	});

	it("blocks users from write endpoints", async () => {
		const response = await request(createProtectedApp())
			.post("/resource")
			.set("Authorization", `Bearer ${createToken("user")}`)
			.send({});

		expect(response.status).toBe(403);
		expect(response.body).toEqual({
			message: "Users can only access list and information endpoints",
		});
	});

	it("allows admins to access write endpoints", async () => {
		const response = await request(createProtectedApp())
			.post("/resource")
			.set("Authorization", `Bearer ${createToken("admin")}`)
			.send({});

		expect(response.status).toBe(200);
		expect(response.body).toEqual({ ok: true });
	});
});
