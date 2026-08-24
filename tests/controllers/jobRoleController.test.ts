import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { JobRolesController } from "../../src/controllers/jobRoleController.js";
import { JobRoleValidationError } from "../../src/errors/customErrors.js";
import { BandModel } from "../../src/models/bandModels.js";
import { CapabilityModel } from "../../src/models/capabilityModels.js";
import {
	JobRoleDetailedResponseModel,
	JobRoleResponseModel,
} from "../../src/models/jobRoleModels.js";
import { StatusModel } from "../../src/models/statusModel.js";
import type { JobRoleService } from "../../src/services/jobRoleService.js";
import {
	JobRoleApplicationConflictError,
	JobRoleNotFoundError,
} from "../../src/services/jobRoleService.js";

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

function createFakeApplicationService(
	applyForRole: ReturnType<typeof vi.fn>,
): JobRoleService {
	return { applyForRole } as unknown as JobRoleService;
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
	} as unknown as Response;
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

describe("JobRolesController.getJobRoleById", () => {
	it("responds with the job role from the service", async () => {
		const getJobRoleById = vi.fn().mockResolvedValue(detailedJobRole);
		const controller = new JobRolesController(
			createFakeServiceById(getJobRoleById),
		);
		const res = createMockResponse();
		const next = vi.fn() as unknown as NextFunction;

		await controller.getJobRoleById(
			{ params: { id: "1" } } as unknown as Request,
			res,
			next,
		);

		expect(getJobRoleById).toHaveBeenCalledWith(1);
		expect(res.json).toHaveBeenCalledWith(detailedJobRole);
		expect(next).not.toHaveBeenCalled();
	});

	it.each(["abc", "0", "-1", "1.5"])(
		"responds with 400 when the ID is %s",
		async (id) => {
			const getJobRoleById = vi.fn();
			const controller = new JobRolesController(
				createFakeServiceById(getJobRoleById),
			);
			const res = createMockResponse();
			const next = vi.fn() as unknown as NextFunction;

			await controller.getJobRoleById(
				{ params: { id } } as unknown as Request,
				res,
				next,
			);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(getJobRoleById).not.toHaveBeenCalled();
			expect(next).not.toHaveBeenCalled();
		},
	);

	it("responds with 404 when no job role has that ID", async () => {
		const controller = new JobRolesController(
			createFakeServiceById(vi.fn().mockResolvedValue(null)),
		);
		const res = createMockResponse();
		const next = vi.fn() as unknown as NextFunction;

		await controller.getJobRoleById(
			{ params: { id: "99" } } as unknown as Request,
			res,
			next,
		);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({ message: "Job role not found" });
		expect(next).not.toHaveBeenCalled();
	});

	it("forwards errors to the error-handling middleware", async () => {
		const error = new Error("boom");
		const controller = new JobRolesController(
			createFakeServiceById(vi.fn().mockRejectedValue(error)),
		);
		const res = createMockResponse();
		const next = vi.fn() as unknown as NextFunction;

		await controller.getJobRoleById(
			{ params: { id: "1" } } as unknown as Request,
			res,
			next,
		);

		expect(next).toHaveBeenCalledWith(error);
		expect(res.json).not.toHaveBeenCalled();
	});
});

describe("JobRolesController.applyForRole", () => {
	it("responds with 201 and created application", async () => {
		const applyForRole = vi.fn().mockResolvedValue({
			applicationId: 1,
			jobRoleId: 2,
			userId: 7,
			applicationStatus: "in progress",
		});
		const controller = new JobRolesController(
			createFakeApplicationService(applyForRole),
		);
		const res = createMockResponse();
		(res as unknown as { locals: Record<string, unknown> }).locals = {
			auth: { sub: "7" },
		};
		const next = vi.fn() as unknown as NextFunction;

		await controller.applyForRole(
			{
				params: { id: "2" },
				body: {
					fullName: "Jane Applicant",
					countryCode: "+44",
					phoneNumber: "7123 456 789",
					email: "jane.applicant@example.com",
					applicationText: "I am interested in this role.",
					previousExperience: "5 years experience",
				},
			} as unknown as Request,
			res,
			next,
		);

		expect(applyForRole).toHaveBeenCalledWith(
			2,
			7,
			"Jane Applicant",
			"+44",
			"7123 456 789",
			"jane.applicant@example.com",
			"I am interested in this role.",
			"5 years experience",
		);
		expect(res.status).toHaveBeenCalledWith(201);
		expect(next).not.toHaveBeenCalled();
	});

	it("responds with 400 when request body is invalid", async () => {
		const applyForRole = vi.fn();
		const controller = new JobRolesController(
			createFakeApplicationService(applyForRole),
		);
		const res = createMockResponse();
		(res as unknown as { locals: Record<string, unknown> }).locals = {
			auth: { sub: "7" },
		};
		const next = vi.fn() as unknown as NextFunction;

		await controller.applyForRole(
			{
				params: { id: "2" },
				body: {
					fullName: "",
					countryCode: "+44",
					phoneNumber: "",
					email: "invalid",
					applicationText: "",
				},
			} as unknown as Request,
			res,
			next,
		);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(applyForRole).not.toHaveBeenCalled();
		expect(next).not.toHaveBeenCalled();
	});

	it("responds with 401 when auth subject is unavailable", async () => {
		const controller = new JobRolesController(
			createFakeApplicationService(vi.fn()),
		);
		const res = createMockResponse();
		(res as unknown as { locals: Record<string, unknown> }).locals = {};
		const next = vi.fn() as unknown as NextFunction;

		await controller.applyForRole(
			{
				params: { id: "2" },
				body: {
					fullName: "Jane Applicant",
					countryCode: "+44",
					phoneNumber: "7123 456 789",
					email: "jane.applicant@example.com",
					applicationText: "I am interested in this role.",
				},
			} as unknown as Request,
			res,
			next,
		);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(next).not.toHaveBeenCalled();
	});

	it("responds with 404 when target role is not found", async () => {
		const applyForRole = vi
			.fn()
			.mockRejectedValue(new JobRoleNotFoundError("Job role not found"));
		const controller = new JobRolesController(
			createFakeApplicationService(applyForRole),
		);
		const res = createMockResponse();
		(res as unknown as { locals: Record<string, unknown> }).locals = {
			auth: { sub: "7" },
		};
		const next = vi.fn() as unknown as NextFunction;

		await controller.applyForRole(
			{
				params: { id: "2" },
				body: {
					fullName: "Jane Applicant",
					countryCode: "+44",
					phoneNumber: "7123 456 789",
					email: "jane.applicant@example.com",
					applicationText: "I am interested in this role.",
				},
			} as unknown as Request,
			res,
			next,
		);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({ message: "Job role not found" });
		expect(next).not.toHaveBeenCalled();
	});

	it("responds with 409 when role cannot be applied for", async () => {
		const applyForRole = vi
			.fn()
			.mockRejectedValue(
				new JobRoleApplicationConflictError(
					"This role is not accepting applications",
				),
			);
		const controller = new JobRolesController(
			createFakeApplicationService(applyForRole),
		);
		const res = createMockResponse();
		(res as unknown as { locals: Record<string, unknown> }).locals = {
			auth: { sub: "7" },
		};
		const next = vi.fn() as unknown as NextFunction;

		await controller.applyForRole(
			{
				params: { id: "2" },
				body: {
					fullName: "Jane Applicant",
					countryCode: "+44",
					phoneNumber: "7123 456 789",
					email: "jane.applicant@example.com",
					applicationText: "I am interested in this role.",
				},
			} as unknown as Request,
			res,
			next,
		);

		expect(res.status).toHaveBeenCalledWith(409);
		expect(res.json).toHaveBeenCalledWith({
			message: "This role is not accepting applications",
		});
		expect(next).not.toHaveBeenCalled();
	});

	it("responds with 400 for invalid country code format", async () => {
		const applyForRole = vi.fn();
		const controller = new JobRolesController(
			createFakeApplicationService(applyForRole),
		);
		const res = createMockResponse();
		(res as unknown as { locals: Record<string, unknown> }).locals = {
			auth: { sub: "7" },
		};
		const next = vi.fn() as unknown as NextFunction;

		await controller.applyForRole(
			{
				params: { id: "2" },
				body: {
					fullName: "Jane Applicant",
					countryCode: "44",
					phoneNumber: "7123 456 789",
					email: "jane.applicant@example.com",
					applicationText: "I am interested in this role.",
				},
			} as unknown as Request,
			res,
			next,
		);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({
			message: "Country code must be in format +XXX (e.g., +44)",
		});
		expect(applyForRole).not.toHaveBeenCalled();
	});

	it("responds with 400 for invalid phone number format", async () => {
		const applyForRole = vi.fn();
		const controller = new JobRolesController(
			createFakeApplicationService(applyForRole),
		);
		const res = createMockResponse();
		(res as unknown as { locals: Record<string, unknown> }).locals = {
			auth: { sub: "7" },
		};
		const next = vi.fn() as unknown as NextFunction;

		await controller.applyForRole(
			{
				params: { id: "2" },
				body: {
					fullName: "Jane Applicant",
					countryCode: "+44",
					phoneNumber: "07123-ABCD",
					email: "jane.applicant@example.com",
					applicationText: "I am interested in this role.",
				},
			} as unknown as Request,
			res,
			next,
		);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({
			message:
				"Phone number can only contain numbers, spaces, hyphens, and parentheses",
		});
		expect(applyForRole).not.toHaveBeenCalled();
	});

	it("responds with 400 for invalid email format", async () => {
		const applyForRole = vi.fn();
		const controller = new JobRolesController(
			createFakeApplicationService(applyForRole),
		);
		const res = createMockResponse();
		(res as unknown as { locals: Record<string, unknown> }).locals = {
			auth: { sub: "7" },
		};
		const next = vi.fn() as unknown as NextFunction;

		await controller.applyForRole(
			{
				params: { id: "2" },
				body: {
					fullName: "Jane Applicant",
					countryCode: "+44",
					phoneNumber: "7123 456 789",
					email: "not-an-email",
					applicationText: "I am interested in this role.",
				},
			} as unknown as Request,
			res,
			next,
		);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({
			message: "Email must be a valid email address",
		});
		expect(applyForRole).not.toHaveBeenCalled();
	});

	it("forwards unexpected errors to the error handler", async () => {
		const error = new Error("db down");
		const applyForRole = vi.fn().mockRejectedValue(error);
		const controller = new JobRolesController(
			createFakeApplicationService(applyForRole),
		);
		const res = createMockResponse();
		(res as unknown as { locals: Record<string, unknown> }).locals = {
			auth: { sub: "7" },
		};
		const next = vi.fn() as unknown as NextFunction;

		await controller.applyForRole(
			{
				params: { id: "2" },
				body: {
					fullName: "Jane Applicant",
					countryCode: "+44",
					phoneNumber: "7123 456 789",
					email: "jane.applicant@example.com",
					applicationText: "I am interested in this role.",
				},
			} as unknown as Request,
			res,
			next,
		);

		expect(next).toHaveBeenCalledWith(error);
		expect(res.status).not.toHaveBeenCalled();
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
		const next = vi.fn() as unknown as NextFunction;

		await controller.createJobRole(
			{ body: validatedBody } as unknown as Request,
			res,
			next,
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
		const next = vi.fn() as unknown as NextFunction;

		await controller.createJobRole(
			{ body: validatedBody } as unknown as Request,
			res,
			next,
		);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({ message: "Band not found" });
		expect(next).not.toHaveBeenCalled();
	});

	it("forwards unexpected errors to the error handler", async () => {
		const error = new Error("db down");
		const createJobRole = vi.fn().mockRejectedValue(error);
		const controller = new JobRolesController(
			createFakeCreateService(createJobRole),
		);
		const res = createMockResponse();
		const next = vi.fn() as unknown as NextFunction;

		await controller.createJobRole(
			{ body: validatedBody } as unknown as Request,
			res,
			next,
		);

		expect(next).toHaveBeenCalledWith(error);
		expect(res.status).not.toHaveBeenCalled();
	});
});
