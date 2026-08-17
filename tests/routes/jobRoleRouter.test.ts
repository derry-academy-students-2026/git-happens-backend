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
	jobRoleService: { getJobRoles: vi.fn(), getJobRoleById: vi.fn() },
}));

import jobRoleRouter from "../../src/routes/jobRoleRouter.js";
import { jobRoleService } from "../../src/services/jobRoleService.js";

const getJobRoles = jobRoleService.getJobRoles as unknown as ReturnType<
	typeof vi.fn
>;
const getJobRoleById = jobRoleService.getJobRoleById as unknown as ReturnType<
	typeof vi.fn
>;

function createApp() {
	const app = express();
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
	});

	it("GET /job-roles returns the page of job roles from the service, defaulting to page 1", async () => {
		getJobRoles.mockResolvedValue({
			jobRoles: [{ jobRoleId: 1, roleName: "Software Engineer" }],
			page: 1,
			pageSize: 10,
			totalCount: 1,
			totalPages: 1,
		});

		const response = await request(createApp()).get("/job-roles");

		expect(getJobRoles).toHaveBeenCalledWith(1);
		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			jobRoles: [{ jobRoleId: 1, roleName: "Software Engineer" }],
			page: 1,
			pageSize: 10,
			totalCount: 1,
			totalPages: 1,
		});
	});

	it("GET /job-roles?page=2 passes the page query param to the service", async () => {
		getJobRoles.mockResolvedValue({
			jobRoles: [],
			page: 2,
			pageSize: 10,
			totalCount: 0,
			totalPages: 0,
		});

		const response = await request(createApp()).get("/job-roles?page=2");

		expect(getJobRoles).toHaveBeenCalledWith(2);
		expect(response.status).toBe(200);
	});

	it("GET /job-roles?page=abc returns 400 for a non-numeric page", async () => {
		const response = await request(createApp()).get("/job-roles?page=abc");

		expect(response.status).toBe(400);
		expect(getJobRoles).not.toHaveBeenCalled();
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
});
