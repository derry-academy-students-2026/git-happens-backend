import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../src/app.js";

describe("GET /health", () => {
	it("should return 200 OK", async () => {
		const response = await request(app).get("/health");
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty("status", "OK");
		expect(response.body).toHaveProperty("timestamp");
	});
});

describe("Protected API endpoints", () => {
	it("should require a token for GET /job-roles", async () => {
		const response = await request(app).get("/job-roles");

		expect(response.status).toBe(401);
		expect(response.body).toEqual({
			message: "Authentication required",
			redirectTo: "/login",
		});
	});
});
