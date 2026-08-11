import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { JobRolesController } from "../../src/controllers/jobRoleController.js";
import type { JobRoleService } from "../../src/services/jobRoleService.js";
import { JobRoleResponseModel } from "../../src/models/jobRoleModels.js";
import { CapabilityModel } from "../../src/models/capabilityModels.js";
import { BandModel } from "../../src/models/bandModels.js";

const capability = new CapabilityModel(1, "Software Engineering");
const band = new BandModel(2, "Band 3 - Senior");
const jobRole = new JobRoleResponseModel(1, "Software Engineer", "Remote", capability, band, new Date("2024-09-30"), "Open");

function createFakeService(getJobRoles: ReturnType<typeof vi.fn>): JobRoleService {
	return { getJobRoles } as unknown as JobRoleService;
}

function createMockResponse(): Response {
	return { json: vi.fn() } as unknown as Response;
}

describe("JobRolesController.getJobRoles", () => {
	it("responds with the job roles from the service", async () => {
		const service = createFakeService(vi.fn().mockResolvedValue([jobRole]));
		const controller = new JobRolesController(service);
		const res = createMockResponse();
		const next = vi.fn() as unknown as NextFunction;

		await controller.getJobRoles({} as Request, res, next);

		expect(res.json).toHaveBeenCalledWith([jobRole]);
		expect(next).not.toHaveBeenCalled();
	});

	it("forwards errors to the error-handling middleware", async () => {
		const error = new Error("boom");
		const service = createFakeService(vi.fn().mockRejectedValue(error));
		const controller = new JobRolesController(service);
		const res = createMockResponse();
		const next = vi.fn() as unknown as NextFunction;

		await controller.getJobRoles({} as Request, res, next);

		expect(next).toHaveBeenCalledWith(error);
		expect(res.json).not.toHaveBeenCalled();
	});
});
