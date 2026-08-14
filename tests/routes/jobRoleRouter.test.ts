import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/lib/logger.js", () => ({
	default: {
		debug: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	},
}));

vi.mock("../../src/services/jobRoleService.js", () => ({
	jobRoleService: {
		getJobRoles: vi.fn(),
		getJobRoleById: vi.fn(),
		applyForRole: vi.fn(),
	},
}));

import jobRoleRouter from "../../src/routes/jobRoleRouter.js";
import { jobRoleService } from "../../src/services/jobRoleService.js";

const getJobRoles = jobRoleService.getJobRoles as unknown as ReturnType<
	typeof vi.fn
>;
const getJobRoleById = jobRoleService.getJobRoleById as unknown as ReturnType<
	typeof vi.fn
>;
const applyForRole = jobRoleService.applyForRole as unknown as ReturnType<
	typeof vi.fn
>;

function createApp() {
	const app = express();
	app.use(express.json());
	app.use((_req, res, next) => {
		res.locals.auth = { sub: "7", role: "user" };
		next();
	});
	app.use("/job-roles", jobRoleRouter);
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

describe("jobRoleRouter", () => {
	beforeEach(() => {
		getJobRoles.mockReset();
		getJobRoleById.mockReset();
		applyForRole.mockReset();
	});

	it("GET /job-roles returns the job roles from the service", async () => {
		getJobRoles.mockResolvedValue([
			{ jobRoleId: 1, roleName: "Software Engineer" },
		]);

		const response = await request(createApp()).get("/job-roles");

		expect(response.status).toBe(200);
		expect(response.body).toEqual([
			{ jobRoleId: 1, roleName: "Software Engineer" },
		]);
	});

	it("forwards service errors to the error handler", async () => {
		getJobRoles.mockRejectedValue(new Error("boom"));

		const response = await request(createApp()).get("/job-roles");

		expect(response.status).toBe(500);
		expect(response.body).toEqual({ message: "boom" });
	});

	it("GET /job-roles/:id returns the job role from the service", async () => {
		getJobRoleById.mockResolvedValue({
			jobRoleId: 1,
			roleName: "Software Engineer",
		});

		const response = await request(createApp()).get("/job-roles/1");

		expect(getJobRoleById).toHaveBeenCalledWith(1);
		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			jobRoleId: 1,
			roleName: "Software Engineer",
		});
	});

	it("GET /job-roles/:id returns 400 for a non-numeric ID", async () => {
		const response = await request(createApp()).get("/job-roles/abc");

		expect(response.status).toBe(400);
		expect(getJobRoleById).not.toHaveBeenCalled();
	});

	it("GET /job-roles/:id returns 404 when the job role does not exist", async () => {
		getJobRoleById.mockResolvedValue(null);

		const response = await request(createApp()).get("/job-roles/99");

		expect(response.status).toBe(404);
		expect(response.body).toEqual({ message: "Job role not found" });
	});

	it("POST /job-roles/:id/applications creates an application", async () => {
		applyForRole.mockResolvedValue({
			applicationId: 10,
			jobRoleId: 1,
			userId: 7,
			applicationStatus: "in progress",
		});

		const response = await request(createApp())
			.post("/job-roles/1/applications")
			.send({
				fullName: "Jane Applicant",
				countryCode: "+44",
				phoneNumber: "7123 456 789",
				email: "jane.applicant@example.com",
				applicationText: "I am interested in this role.",
				previousExperience: "5 years experience",
			});

		expect(response.status).toBe(201);
		expect(applyForRole).toHaveBeenCalledWith(
			1,
			7,
			"Jane Applicant",
			"+44",
			"7123 456 789",
			"jane.applicant@example.com",
			"I am interested in this role.",
			"5 years experience",
		);
	});
});
