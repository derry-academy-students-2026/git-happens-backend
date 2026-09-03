import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const serviceMocks = vi.hoisted(() => ({
	submitJobApplication: vi.fn(),
}));

vi.mock("../../src/services/applicationService.js", () => ({
	ApplicationService: class {
		submitJobApplication = serviceMocks.submitJobApplication;
	},
}));

import applicationRouter from "../../src/routes/applicationRouter.js";

function createApp() {
	const app = express();
	app.use(express.json());
	app.use((_req, res, next) => {
		res.locals.auth = { sub: "7", role: "user" };
		next();
	});
	app.use("/applications", applicationRouter);
	app.use("/job-roles", applicationRouter);
	return app;
}

describe("applicationRouter", () => {
	beforeEach(() => {
		serviceMocks.submitJobApplication.mockReset();
	});

	it("submits an application at the frontend API path", async () => {
		serviceMocks.submitJobApplication.mockResolvedValue({ applicationId: 10 });

		const response = await request(createApp())
			.post("/applications/job-roles/1")
			.send({
				fullName: "Jane Applicant",
				countryCode: "+44",
				phoneNumber: "7123 456 789",
				email: "jane@example.com",
				applicationText: "I am interested in this role.",
			});

		expect(response.status).toBe(201);
		expect(serviceMocks.submitJobApplication).toHaveBeenCalledWith(
			1,
			7,
			expect.objectContaining({ fullName: "Jane Applicant" }),
		);
	});

	it("rejects an invalid job role ID before reaching the controller", async () => {
		const response = await request(createApp())
			.post("/applications/job-roles/invalid")
			.send({});

		expect(response.status).toBe(400);
		expect(serviceMocks.submitJobApplication).not.toHaveBeenCalled();
	});

	it("submits an application through the job role path", async () => {
		serviceMocks.submitJobApplication.mockResolvedValue({ applicationId: 10 });

		const response = await request(createApp())
			.post("/job-roles/1/applications")
			.send({
				fullName: "Jane Applicant",
				countryCode: "+44",
				phoneNumber: "7123 456 789",
				email: "jane@example.com",
				applicationText: "I am interested in this role.",
			});

		expect(response.status).toBe(201);
		expect(serviceMocks.submitJobApplication).toHaveBeenCalledWith(
			1,
			7,
			expect.objectContaining({ fullName: "Jane Applicant" }),
		);
	});
});
