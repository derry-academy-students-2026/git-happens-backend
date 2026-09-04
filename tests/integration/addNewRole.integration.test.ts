import argon2 from "argon2";
import jwt from "jsonwebtoken";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// hoisted so the vi.mock factories below can reference the in-memory database
const db = vi.hoisted(() => {
	interface JobRoleRow {
		jobRoleId: number;
		roleName: string;
		location: string;
		capabilityId: number;
		bandId: number;
		closingDate: Date;
		description: string;
		responsibilities: string;
		sharepointUrl: string;
		statusId: number;
		numberOfOpenPositions: number;
	}

	return {
		capabilities: [
			{ capabilityId: 1, capabilityName: "Engineering" },
			{ capabilityId: 2, capabilityName: "Platforms" },
		],
		bands: [
			{ bandId: 1, bandName: "Trainee" },
			{ bandId: 3, bandName: "Senior Associate" },
		],
		statuses: [
			{ statusId: 10, statusName: "Open" },
			{ statusId: 11, statusName: "Closed" },
		],
		jobRoles: [] as JobRoleRow[],
		nextJobRoleId: 1,
		users: [] as {
			id: number;
			email: string;
			passwordHash: string;
			role: { roleName: string };
		}[],
	};
});

vi.mock("../../src/lib/logger.js", () => ({
	default: {
		debug: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	},
}));

// replaces the real database with an in-memory store so the full request pipeline
// (router -> controller -> service -> mapper) is exercised without a live Postgres
vi.mock("../../src/prismaClient.js", () => {
	/** Attaches the capability, band and status relations a job role response needs. */
	const withRelations = (row: (typeof db.jobRoles)[number]) => ({
		...row,
		capability: db.capabilities.find(
			(capability) => capability.capabilityId === row.capabilityId,
		),
		band: db.bands.find((band) => band.bandId === row.bandId),
		status: db.statuses.find((status) => status.statusId === row.statusId),
	});

	return {
		default: {
			capability: {
				findUnique: vi.fn(
					async ({ where }: { where: { capabilityId: number } }) =>
						db.capabilities.find(
							(capability) => capability.capabilityId === where.capabilityId,
						) ?? null,
				),
			},
			band: {
				findUnique: vi.fn(async ({ where }: { where: { bandId: number } }) => {
					return db.bands.find((band) => band.bandId === where.bandId) ?? null;
				}),
			},
			status: {
				findUnique: vi.fn(
					async ({ where }: { where: { statusName: string } }) =>
						db.statuses.find(
							(status) => status.statusName === where.statusName,
						) ?? null,
				),
			},
			jobRole: {
				create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
					const row = {
						...(data as unknown as (typeof db.jobRoles)[number]),
						jobRoleId: db.nextJobRoleId++,
					};
					db.jobRoles.push(row);
					return withRelations(row);
				}),
				update: vi.fn(
					async ({
						where,
						data,
					}: {
						where: { jobRoleId: number };
						data: Record<string, unknown>;
					}) => {
						const row = db.jobRoles.find(
							(jobRole) => jobRole.jobRoleId === where.jobRoleId,
						);
						if (!row) throw new Error("Job role not found");
						Object.assign(row, data);
						return withRelations(row);
					},
				),
				findUnique: vi.fn(
					async ({ where }: { where: { jobRoleId: number } }) => {
						const row = db.jobRoles.find(
							(jobRole) => jobRole.jobRoleId === where.jobRoleId,
						);
						return row ? withRelations(row) : null;
					},
				),
				findMany: vi.fn(async () => db.jobRoles.map(withRelations)),
				count: vi.fn(async () => db.jobRoles.length),
			},
			user: {
				findUnique: vi.fn(
					async ({ where }: { where: { email: string } }) =>
						db.users.find((user) => user.email === where.email) ?? null,
				),
			},
		},
	};
});

import app from "../../src/app.js";
import { authService } from "../../src/services/authService.js";

const TEST_SECRET = "add-new-role-integration-secret";

// Derived rather than hard-coded so the suite cannot expire.
const FUTURE_CLOSING_DATE = new Date(
	Date.now() + 30 * 24 * 60 * 60 * 1000,
).toISOString();
const PAST_CLOSING_DATE = new Date(
	Date.now() - 24 * 60 * 60 * 1000,
).toISOString();

/** Signs a token carrying the claims the auth middleware requires. */
function createToken(role: string): string {
	return jwt.sign(
		{ sub: "1", email: "user@example.com", role, jti: `${role}-jti` },
		TEST_SECRET,
		{ expiresIn: "1h" },
	);
}

/** Builds a valid add-new-role request body, overridable per test. */
function validRoleRequest(overrides: Record<string, unknown> = {}) {
	return {
		roleName: "Software Engineer",
		location: "Belfast",
		capabilityId: 1,
		bandId: 3,
		closingDate: FUTURE_CLOSING_DATE,
		description: "Builds and maintains delivery software.",
		responsibilities: "Write code, review pull requests, support releases.",
		numberOfOpenPositions: 4,
		...overrides,
	};
}

describe("POST /job-roles (add new role integration)", () => {
	const originalSecret = process.env.JWT_SECRET;

	beforeEach(() => {
		process.env.JWT_SECRET = TEST_SECRET;
		db.jobRoles.length = 0;
		db.users.length = 0;
		db.nextJobRoleId = 1;
	});

	afterEach(() => {
		if (originalSecret === undefined) {
			delete process.env.JWT_SECRET;
			return;
		}
		process.env.JWT_SECRET = originalSecret;
	});

	it("creates a job role and returns the persisted detail model", async () => {
		const response = await request(app)
			.post("/job-roles")
			.set("Authorization", `Bearer ${createToken("admin")}`)
			.send(validRoleRequest());

		expect(response.status).toBe(201);
		expect(response.body).toMatchObject({
			jobRoleId: 1,
			roleName: "Software Engineer",
			location: "Belfast",
			capability: { capabilityId: 1, capabilityName: "Engineering" },
			band: { bandId: 3, bandName: "Senior Associate" },
			status: { statusId: 10, statusName: "Open" },
			description: "Builds and maintains delivery software.",
			responsibilities: "Write code, review pull requests, support releases.",
			numberOfOpenPositions: 4,
		});
		expect(response.body.closingDate).toBe(FUTURE_CLOSING_DATE);
		expect(db.jobRoles).toHaveLength(1);
	});

	it("makes the new job role retrievable through GET /job-roles/:id", async () => {
		const createResponse = await request(app)
			.post("/job-roles")
			.set("Authorization", `Bearer ${createToken("admin")}`)
			.send(validRoleRequest({ roleName: "Test Engineer" }));

		expect(createResponse.status).toBe(201);

		const getResponse = await request(app)
			.get(`/job-roles/${createResponse.body.jobRoleId}`)
			.set("Authorization", `Bearer ${createToken("user")}`);

		expect(getResponse.status).toBe(200);
		expect(getResponse.body).toEqual(createResponse.body);
	});

	it("allows an admin to edit an existing job role", async () => {
		const createResponse = await request(app)
			.post("/job-roles")
			.set("Authorization", `Bearer ${createToken("admin")}`)
			.send(validRoleRequest());

		const updateResponse = await request(app)
			.put(`/job-roles/${createResponse.body.jobRoleId}`)
			.set("Authorization", `Bearer ${createToken("admin")}`)
			.send(
				validRoleRequest({
					roleName: "Principal Software Engineer",
					location: "London",
					numberOfOpenPositions: 2,
				}),
			);

		expect(updateResponse.status).toBe(200);
		expect(updateResponse.body).toMatchObject({
			jobRoleId: 1,
			roleName: "Principal Software Engineer",
			location: "London",
			numberOfOpenPositions: 2,
			status: { statusName: "Open" },
			sharepointUrl: "https://sharepoint.example.com/job-roles/pending",
		});
	});

	it("returns 404 when editing a job role that does not exist", async () => {
		const response = await request(app)
			.put("/job-roles/999")
			.set("Authorization", `Bearer ${createToken("admin")}`)
			.send(validRoleRequest());

		expect(response.status).toBe(404);
		expect(response.body).toEqual({ message: "Job role not found" });
	});

	it("rejects non-admin edits without changing the job role", async () => {
		await request(app)
			.post("/job-roles")
			.set("Authorization", `Bearer ${createToken("admin")}`)
			.send(validRoleRequest());

		const response = await request(app)
			.put("/job-roles/1")
			.set("Authorization", `Bearer ${createToken("user")}`)
			.send(validRoleRequest({ roleName: "Should Not Change" }));

		expect(response.status).toBe(403);
		expect(db.jobRoles[0].roleName).toBe("Software Engineer");
	});

	it("includes the new job role in GET /job-roles", async () => {
		await request(app)
			.post("/job-roles")
			.set("Authorization", `Bearer ${createToken("admin")}`)
			.send(validRoleRequest({ roleName: "Data Engineer" }));

		const listResponse = await request(app)
			.get("/job-roles")
			.set("Authorization", `Bearer ${createToken("admin")}`);

		expect(listResponse.status).toBe(200);
		expect(listResponse.body.jobRoles).toHaveLength(1);
		expect(listResponse.body.jobRoles[0]).toMatchObject({
			jobRoleId: 1,
			roleName: "Data Engineer",
		});
	});

	it("trims whitespace from the submitted text fields", async () => {
		const response = await request(app)
			.post("/job-roles")
			.set("Authorization", `Bearer ${createToken("admin")}`)
			.send(
				validRoleRequest({
					roleName: "  Product Owner  ",
					location: "  London  ",
				}),
			);

		expect(response.status).toBe(201);
		expect(response.body.roleName).toBe("Product Owner");
		expect(response.body.location).toBe("London");
	});

	it("rejects unauthenticated requests without creating a job role", async () => {
		const response = await request(app)
			.post("/job-roles")
			.send(validRoleRequest());

		expect(response.status).toBe(401);
		expect(db.jobRoles).toHaveLength(0);
	});

	it("rejects non-admin roles without creating a job role", async () => {
		const response = await request(app)
			.post("/job-roles")
			.set("Authorization", `Bearer ${createToken("user")}`)
			.send(validRoleRequest());

		expect(response.status).toBe(403);
		expect(db.jobRoles).toHaveLength(0);
	});

	it.each([
		["missing roleName", { roleName: undefined }],
		["blank roleName", { roleName: "   " }],
		["missing description", { description: undefined }],
		["non-numeric capabilityId", { capabilityId: "1" }],
		["non-integer bandId", { bandId: 1.5 }],
		["zero open positions", { numberOfOpenPositions: 0 }],
		["invalid closing date", { closingDate: "not-a-date" }],
	])("returns 400 for %s", async (_label, overrides) => {
		const response = await request(app)
			.post("/job-roles")
			.set("Authorization", `Bearer ${createToken("admin")}`)
			.send(validRoleRequest(overrides));

		expect(response.status).toBe(400);
		expect(response.body.message).toBe("Invalid job role details");
		expect(response.body.errors.length).toBeGreaterThan(0);
		expect(db.jobRoles).toHaveLength(0);
	});

	it("returns 400 when the closing date is in the past", async () => {
		const response = await request(app)
			.post("/job-roles")
			.set("Authorization", `Bearer ${createToken("admin")}`)
			.send(validRoleRequest({ closingDate: PAST_CLOSING_DATE }));

		expect(response.status).toBe(400);
		expect(response.body.errors).toContainEqual({
			field: "closingDate",
			message: "Closing date must be in the future",
		});
		expect(db.jobRoles).toHaveLength(0);
	});

	it("returns 404 when the capability does not exist", async () => {
		const response = await request(app)
			.post("/job-roles")
			.set("Authorization", `Bearer ${createToken("admin")}`)
			.send(validRoleRequest({ capabilityId: 999 }));

		expect(response.status).toBe(404);
		expect(response.body).toEqual({ message: "Capability not found" });
		expect(db.jobRoles).toHaveLength(0);
	});

	it("returns 404 when the band does not exist", async () => {
		const response = await request(app)
			.post("/job-roles")
			.set("Authorization", `Bearer ${createToken("admin")}`)
			.send(validRoleRequest({ bandId: 999 }));

		expect(response.status).toBe(404);
		expect(response.body).toEqual({ message: "Band not found" });
		expect(db.jobRoles).toHaveLength(0);
	});

	// Guards the login -> create-role contract: a token minted by authService must
	// carry every claim the auth middleware requires.
	it("accepts a token issued by the real login flow", async () => {
		db.users.push({
			id: 7,
			email: "admin1@example.com",
			passwordHash: await argon2.hash("password123!"),
			role: { roleName: "admin" },
		});

		const login = await authService.loginUser(
			"admin1@example.com",
			"password123!",
		);

		const response = await request(app)
			.post("/job-roles")
			.set("Authorization", `Bearer ${login.token}`)
			.send(validRoleRequest());

		expect(response.status).toBe(201);
		expect(db.jobRoles).toHaveLength(1);
	});
});
