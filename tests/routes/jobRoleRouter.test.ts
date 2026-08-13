import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/services/jobRoleService.js", () => ({
	jobRoleService: { getJobRoles: vi.fn() },
}));

import jobRoleRouter from "../../src/routes/jobRoleRouter.js";
import { jobRoleService } from "../../src/services/jobRoleService.js";

const getJobRoles = jobRoleService.getJobRoles as unknown as ReturnType<
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
});
