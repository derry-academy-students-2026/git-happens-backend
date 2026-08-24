import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/prismaClient.js", () => ({
	default: {
		jobRole: {
			findMany: vi.fn(),
			findUnique: vi.fn(),
			create: vi.fn(),
		},
		jobApplication: {
			create: vi.fn(),
		},
		capability: { findUnique: vi.fn() },
		band: { findUnique: vi.fn() },
		status: { findUnique: vi.fn() },
	},
}));

import { BandModel } from "../../src/models/bandModels.js";
import { CapabilityModel } from "../../src/models/capabilityModels.js";
import { StatusModel } from "../../src/models/statusModel.js";
import prisma from "../../src/prismaClient.js";
import {
	JobRoleApplicationConflictError,
	JobRoleApplicationValidationError,
	JobRoleNotFoundError,
	JobRoleService,
} from "../../src/services/jobRoleService.js";

const findMany = prisma.jobRole.findMany as unknown as ReturnType<typeof vi.fn>;
const findUnique = prisma.jobRole.findUnique as unknown as ReturnType<
	typeof vi.fn
>;
const create = prisma.jobRole.create as unknown as ReturnType<typeof vi.fn>;
const createApplication = prisma.jobApplication.create as unknown as ReturnType<
	typeof vi.fn
>;
const findCapability = prisma.capability.findUnique as unknown as ReturnType<
	typeof vi.fn
>;
const findBand = prisma.band.findUnique as unknown as ReturnType<typeof vi.fn>;
const findStatus = prisma.status.findUnique as unknown as ReturnType<
	typeof vi.fn
>;

const capability = new CapabilityModel(1, "Software Engineering");
const band = new BandModel(2, "Band 3 - Senior");
const status = new StatusModel(1, "Open");
const closingDate = new Date("2024-09-30");

const jobRoleRow = {
	jobRoleId: 1,
	roleName: "Software Engineer",
	location: "Remote",
	capability: { capabilityId: 1, capabilityName: "Software Engineering" },
	band: { bandId: 2, bandName: "Band 3 - Senior" },
	closingDate,
	status: { statusId: 1, statusName: "Open" },
	description: "Build software.",
	responsibilities: "Write code; review code.",
	sharepointUrl: "https://sharepoint.example.com/job-roles/1",
	numberOfOpenPositions: 3,
};

describe("JobRoleService.getJobRoles", () => {
	beforeEach(() => {
		findMany.mockReset();
	});

	it("queries job roles with their capability and band, mapped to response models", async () => {
		findMany.mockResolvedValue([jobRoleRow]);

		const service = new JobRoleService();
		const result = await service.getJobRoles();

		expect(findMany).toHaveBeenCalledWith({
			include: { capability: true, band: true, status: true },
		});
		expect(result).toEqual([
			{
				jobRoleId: 1,
				roleName: "Software Engineer",
				location: "Remote",
				capability,
				band,
				closingDate,
				status,
			},
		]);
	});

	it("returns an empty array when there are no job roles", async () => {
		findMany.mockResolvedValue([]);

		const service = new JobRoleService();
		const result = await service.getJobRoles();

		expect(result).toEqual([]);
	});

	it("propagates errors thrown by the database query", async () => {
		findMany.mockRejectedValue(new Error("db error"));

		const service = new JobRoleService();

		await expect(service.getJobRoles()).rejects.toThrow("db error");
	});
});

describe("JobRoleService.getJobRoleById", () => {
	beforeEach(() => {
		findUnique.mockReset();
	});

	it("queries the job role by ID, mapped to a detailed response model", async () => {
		findUnique.mockResolvedValue(jobRoleRow);

		const service = new JobRoleService();
		const result = await service.getJobRoleById(1);

		expect(findUnique).toHaveBeenCalledWith({
			where: { jobRoleId: 1 },
			include: { capability: true, band: true, status: true },
		});
		expect(result).toEqual({
			jobRoleId: 1,
			roleName: "Software Engineer",
			location: "Remote",
			capability,
			band,
			closingDate,
			status,
			description: "Build software.",
			responsibilities: "Write code; review code.",
			sharepointUrl: "https://sharepoint.example.com/job-roles/1",
			numberOfOpenPositions: 3,
		});
	});

	it("returns null when no job role has that ID", async () => {
		findUnique.mockResolvedValue(null);

		const service = new JobRoleService();

		await expect(service.getJobRoleById(99)).resolves.toBeNull();
	});

	it("propagates errors thrown by the database query", async () => {
		findUnique.mockRejectedValue(new Error("db error"));

		const service = new JobRoleService();

		await expect(service.getJobRoleById(1)).rejects.toThrow("db error");
	});
});

describe("JobRoleService.applyForRole", () => {
	beforeEach(() => {
		findUnique.mockReset();
		createApplication.mockReset();
	});

	it("creates an in-progress application when role is open and has vacancies", async () => {
		findUnique.mockResolvedValue({
			jobRoleId: 1,
			numberOfOpenPositions: 3,
			status: { statusName: "Open" },
		});
		createApplication.mockResolvedValue({
			applicationId: 10,
			jobRoleId: 1,
			userId: 7,
			fullName: "Jane Applicant",
			countryCode: "+44",
			phoneNumber: "7123 456 789",
			email: "jane.applicant@example.com",
			applicationText: "I am interested in this role.",
			previousExperience: "5 years experience",
			applicationStatus: "in progress",
			createdAt: new Date("2026-08-14T00:00:00.000Z"),
		});

		const service = new JobRoleService();
		const result = await service.applyForRole(
			1,
			7,
			"Jane Applicant",
			"+44",
			"7123 456 789",
			"jane.applicant@example.com",
			"I am interested in this role.",
			"5 years experience",
		);

		expect(findUnique).toHaveBeenCalledWith({
			where: { jobRoleId: 1 },
			include: { status: true },
		});
		expect(createApplication).toHaveBeenCalledWith({
			data: {
				jobRoleId: 1,
				userId: 7,
				fullName: "Jane Applicant",
				countryCode: "+44",
				phoneNumber: "7123 456 789",
				email: "jane.applicant@example.com",
				applicationText: "I am interested in this role.",
				previousExperience: "5 years experience",
				applicationStatus: "in progress",
			},
		});
		expect(result.applicationStatus).toBe("in progress");
		expect(result.countryCode).toBe("+44");
		expect(result.email).toBe("jane.applicant@example.com");
	});

	it("throws not found when the role does not exist", async () => {
		findUnique.mockResolvedValue(null);
		const service = new JobRoleService();

		await expect(
			service.applyForRole(
				1,
				7,
				"Jane",
				"+44",
				"7123456789",
				"jane@example.com",
				"Interested",
			),
		).rejects.toBeInstanceOf(JobRoleNotFoundError);
	});

	it("throws conflict when the role is closed", async () => {
		findUnique.mockResolvedValue({
			jobRoleId: 1,
			numberOfOpenPositions: 3,
			status: { statusName: "Closed" },
		});

		const service = new JobRoleService();
		await expect(
			service.applyForRole(
				1,
				7,
				"Jane",
				"+44",
				"7123456789",
				"jane@example.com",
				"Interested",
			),
		).rejects.toBeInstanceOf(JobRoleApplicationConflictError);
	});

	it("throws conflict when there are no open positions", async () => {
		findUnique.mockResolvedValue({
			jobRoleId: 1,
			numberOfOpenPositions: 0,
			status: { statusName: "Open" },
		});

		const service = new JobRoleService();
		await expect(
			service.applyForRole(
				1,
				7,
				"Jane",
				"+44",
				"7123456789",
				"jane@example.com",
				"Interested",
			),
		).rejects.toBeInstanceOf(JobRoleApplicationConflictError);
	});

	it("throws validation error when role ID is invalid", async () => {
		const service = new JobRoleService();

		await expect(
			service.applyForRole(
				0,
				7,
				"Jane",
				"+44",
				"7123456789",
				"jane@example.com",
				"Interested",
			),
		).rejects.toBeInstanceOf(JobRoleApplicationValidationError);
	});

	it("throws validation error when user ID is invalid", async () => {
		const service = new JobRoleService();

		await expect(
			service.applyForRole(
				1,
				0,
				"Jane",
				"+44",
				"7123456789",
				"jane@example.com",
				"Interested",
			),
		).rejects.toBeInstanceOf(JobRoleApplicationValidationError);
	});

	it("throws conflict when the applicant already applied", async () => {
		findUnique.mockResolvedValue({
			jobRoleId: 1,
			numberOfOpenPositions: 3,
			status: { statusName: "Open" },
		});
		createApplication.mockRejectedValue({ code: "P2002" });

		const service = new JobRoleService();
		await expect(
			service.applyForRole(
				1,
				7,
				"Jane",
				"+44",
				"7123456789",
				"jane@example.com",
				"Interested",
			),
		).rejects.toBeInstanceOf(JobRoleApplicationConflictError);
	});

	it("stores previousExperience as null when omitted or blank", async () => {
		findUnique.mockResolvedValue({
			jobRoleId: 1,
			numberOfOpenPositions: 3,
			status: { statusName: "Open" },
		});
		createApplication.mockResolvedValue({
			applicationId: 11,
			jobRoleId: 1,
			userId: 7,
			fullName: "Jane Applicant",
			countryCode: "+44",
			phoneNumber: "7123 456 789",
			email: "jane.applicant@example.com",
			applicationText: "I am interested in this role.",
			previousExperience: null,
			applicationStatus: "in progress",
			createdAt: new Date("2026-08-14T00:00:00.000Z"),
		});

		const service = new JobRoleService();
		await service.applyForRole(
			1,
			7,
			"Jane Applicant",
			"+44",
			"7123 456 789",
			"jane.applicant@example.com",
			"I am interested in this role.",
			"",
		);

		expect(createApplication).toHaveBeenCalledWith({
			data: expect.objectContaining({
				previousExperience: null,
			}),
		});
	});
});

describe("JobRoleService.createJobRole", () => {
	beforeEach(() => {
		findCapability.mockReset();
		findBand.mockReset();
		findStatus.mockReset();
		create.mockReset();
	});

	it("creates a role using existing references and Open status", async () => {
		findCapability.mockResolvedValue({ capabilityId: 1 });
		findBand.mockResolvedValue({ bandId: 2 });
		findStatus.mockResolvedValue({ statusId: 1 });
		create.mockResolvedValue(jobRoleRow);

		const service = new JobRoleService();
		const result = await service.createJobRole({
			roleName: "Software Engineer",
			location: "Remote",
			capabilityId: 1,
			bandId: 2,
			closingDate,
			description: "Build software.",
			responsibilities: "Write code; review code.",
			numberOfOpenPositions: 3,
		});

		expect(findStatus).toHaveBeenCalledWith({ where: { statusName: "Open" } });
		expect(create).toHaveBeenCalledWith({
			data: expect.objectContaining({
				capabilityId: 1,
				bandId: 2,
				statusId: 1,
				sharepointUrl: "https://sharepoint.example.com/job-roles/pending",
			}),
			include: { capability: true, band: true, status: true },
		});
		expect(result.roleName).toBe("Software Engineer");
	});

	it("rejects an unknown capability", async () => {
		findCapability.mockResolvedValue(null);
		findBand.mockResolvedValue({ bandId: 2 });
		findStatus.mockResolvedValue({ statusId: 1 });

		await expect(
			new JobRoleService().createJobRole({
				roleName: "Role",
				location: "Remote",
				capabilityId: 99,
				bandId: 2,
				closingDate,
				description: "Description",
				responsibilities: "Responsibilities",
				numberOfOpenPositions: 1,
			}),
		).rejects.toThrow("Capability not found");
		expect(create).not.toHaveBeenCalled();
	});
});
