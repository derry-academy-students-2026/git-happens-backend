import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { JobRolesController } from "../../src/controllers/jobRoleController.js";
import { JobRoleValidationError } from "../../src/errors/customErrors.js";
import { BandModel } from "../../src/models/bandModels.js";
import { CapabilityModel } from "../../src/models/capabilityModels.js";
import {
	JobRoleDetailedResponseModel,
	JobRoleResponseModel,
	PaginatedJobRolesResponseModel,
} from "../../src/models/jobRoleModels.js";
import { StatusModel } from "../../src/models/statusModel.js";
import type { JobRoleService } from "../../src/services/jobRoleService.js";

vi.mock("../../src/lib/logger.js", () => ({
	default: {
		debug: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	},
}));

const capability = new CapabilityModel(1, "Software Engineering");
const band = new BandModel(2, "Band 3 - Senior");
const status = new StatusModel(1, "Open");
const jobRole = new JobRoleResponseModel(
	1,
	"Software Engineer",
	"Remote",
	capability,
	band,
	new Date("2024-09-30"),
	status,
);
const detailedJobRole = new JobRoleDetailedResponseModel(
	1,
	"Software Engineer",
	"Remote",
	capability,
	band,
	new Date("2024-09-30"),
	status,
	"Build software.",
	"Write code; review code.",
	"https://sharepoint.example.com/job-roles/1",
	3,
);

function createFakeService(
	getJobRoles: ReturnType<typeof vi.fn>,
): JobRoleService {
	return { getJobRoles } as unknown as JobRoleService;
}

function createFakeServiceById(
	getJobRoleById: ReturnType<typeof vi.fn>,
): JobRoleService {
	return { getJobRoleById } as unknown as JobRoleService;
}

function createFakeCreateService(
	createJobRole: ReturnType<typeof vi.fn>,
): JobRoleService {
	return { createJobRole } as unknown as JobRoleService;
}

function createMockResponse(): Response {
	return {
		json: vi.fn(),
		status: vi.fn().mockReturnThis(),
		locals: { params: { id: 2 }, authUserId: 7 },
	} as unknown as Response;
}

describe("JobRolesController.getJobRoles", () => {
	const paginatedJobRoles = new PaginatedJobRolesResponseModel(
		[jobRole],
		1,
		10,
		1,
		1,
	);

	it("responds with the page of job roles from the service, defaulting to page 1", async () => {
		const getJobRoles = vi.fn().mockResolvedValue(paginatedJobRoles);
		const controller = new JobRolesController(createFakeService(getJobRoles));
		const res = createMockResponse();

		await controller.getJobRoles({ query: {} } as unknown as Request, res);

		expect(getJobRoles).toHaveBeenCalledWith(1);
		expect(res.json).toHaveBeenCalledWith(paginatedJobRoles);
	});

	it("passes the requested page to the service", async () => {
		const getJobRoles = vi.fn().mockResolvedValue(paginatedJobRoles);
		const controller = new JobRolesController(createFakeService(getJobRoles));
		const res = createMockResponse();

		await controller.getJobRoles(
			{ query: { page: "2" } } as unknown as Request,
			res,
		);

		expect(getJobRoles).toHaveBeenCalledWith(2);
	});

	it.each(["abc", "0", "-1", "1.5"])(
		"responds with 400 when page is %s",
		async (page) => {
			const getJobRoles = vi.fn();
			const controller = new JobRolesController(
				createFakeService(getJobRoles),
			);
			const res = createMockResponse();

			await controller.getJobRoles(
				{ query: { page } } as unknown as Request,
				res,
			);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(getJobRoles).not.toHaveBeenCalled();
		},
	);

	it("forwards errors to the error-handling middleware", async () => {
		const error = new Error("boom");
		const service = createFakeService(vi.fn().mockRejectedValue(error));
		const controller = new JobRolesController(service);
		const res = createMockResponse();

		await controller.getJobRoles({ query: {} } as unknown as Request, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
	});
});

describe("JobRolesController.getJobRoleById", () => {
	it("responds with the job role from the service", async () => {
		const getJobRoleById = vi.fn().mockResolvedValue(detailedJobRole);
		const controller = new JobRolesController(
			createFakeServiceById(getJobRoleById),
		);
		const res = createMockResponse();

		await controller.getJobRoleById(
			{ params: { id: "1" } } as unknown as Request,
			res,
		);

		expect(getJobRoleById).toHaveBeenCalledWith(1);
		expect(res.json).toHaveBeenCalledWith(detailedJobRole);
	});

	it.each(["abc", "0", "-1", "1.5"])(
		"responds with 400 when the ID is %s",
		async (id) => {
			const getJobRoleById = vi.fn();
			const controller = new JobRolesController(
				createFakeServiceById(getJobRoleById),
			);
			const res = createMockResponse();

			await controller.getJobRoleById(
				{ params: { id } } as unknown as Request,
				res,
			);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(getJobRoleById).not.toHaveBeenCalled();
		},
	);

	it("responds with 404 when no job role has that ID", async () => {
		const controller = new JobRolesController(
			createFakeServiceById(vi.fn().mockResolvedValue(null)),
		);
		const res = createMockResponse();

		await controller.getJobRoleById(
			{ params: { id: "99" } } as unknown as Request,
			res,
		);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({ message: "Job role not found" });
	});

	it("returns 500 for unexpected errors", async () => {
		const error = new Error("boom");
		const controller = new JobRolesController(
			createFakeServiceById(vi.fn().mockRejectedValue(error)),
		);
		const res = createMockResponse();

		await controller.getJobRoleById(
			{ params: { id: "1" } } as unknown as Request,
			res,
		);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
	});
});

describe("JobRolesController.createJobRole", () => {
	const validatedBody = {
		roleName: "Senior Software Engineer",
		location: "Remote",
		capabilityId: 1,
		bandId: 2,
		closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
		description: "Build software.",
		responsibilities: "Write and review code.",
		numberOfOpenPositions: 2,
	};

	it("creates a job role from a validated request body", async () => {
		const createdJobRole = { jobRoleId: 4, roleName: validatedBody.roleName };
		const createJobRole = vi.fn().mockResolvedValue(createdJobRole);
		const controller = new JobRolesController(
			createFakeCreateService(createJobRole),
		);
		const res = createMockResponse();

		await controller.createJobRole(
			{ body: validatedBody } as unknown as Request,
			res,
		);

		expect(createJobRole).toHaveBeenCalledWith(validatedBody);
		expect(res.status).toHaveBeenCalledWith(201);
		expect(res.json).toHaveBeenCalledWith(createdJobRole);
	});

	it("returns the status carried by a JobRoleValidationError", async () => {
		const createJobRole = vi
			.fn()
			.mockRejectedValue(new JobRoleValidationError("Band not found", 404));
		const controller = new JobRolesController(
			createFakeCreateService(createJobRole),
		);
		const res = createMockResponse();

		await controller.createJobRole(
			{ body: validatedBody } as unknown as Request,
			res,
		);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({ message: "Band not found" });
	});

	it("returns 500 for unexpected errors", async () => {
		const error = new Error("db down");
		const createJobRole = vi.fn().mockRejectedValue(error);
		const controller = new JobRolesController(
			createFakeCreateService(createJobRole),
		);
		const res = createMockResponse();

		await controller.createJobRole(
			{ body: validatedBody } as unknown as Request,
			res,
		);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
	});
});
