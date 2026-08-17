import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/prismaClient.js", () => ({
	default: {
		jobRole: {
			findMany: vi.fn(),
			findUnique: vi.fn(),
			count: vi.fn(),
		},
	},
}));

import { BandModel } from "../../src/models/bandModels.js";
import { CapabilityModel } from "../../src/models/capabilityModels.js";
import { StatusModel } from "../../src/models/statusModel.js";
import prisma from "../../src/prismaClient.js";
import { JobRoleService } from "../../src/services/jobRoleService.js";

const findMany = prisma.jobRole.findMany as unknown as ReturnType<typeof vi.fn>;
const findUnique = prisma.jobRole.findUnique as unknown as ReturnType<
	typeof vi.fn
>;
const count = prisma.jobRole.count as unknown as ReturnType<typeof vi.fn>;

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
		count.mockReset();
	});

	it("queries a page of job roles with their capability and band, mapped to response models", async () => {
		findMany.mockResolvedValue([jobRoleRow]);
		count.mockResolvedValue(1);

		const service = new JobRoleService();
		const result = await service.getJobRoles(1);

		expect(findMany).toHaveBeenCalledWith({
			include: { capability: true, band: true, status: true },
			skip: 0,
			take: 10,
		});
		expect(result).toEqual({
			jobRoles: [
				{
					jobRoleId: 1,
					roleName: "Software Engineer",
					location: "Remote",
					capability,
					band,
					closingDate,
					status,
				},
			],
			page: 1,
			pageSize: 10,
			totalCount: 1,
			totalPages: 1,
		});
	});

	it("skips to the requested page", async () => {
		findMany.mockResolvedValue([]);
		count.mockResolvedValue(25);

		const service = new JobRoleService();
		const result = await service.getJobRoles(3);

		expect(findMany).toHaveBeenCalledWith({
			include: { capability: true, band: true, status: true },
			skip: 20,
			take: 10,
		});
		expect(result.totalPages).toBe(3);
	});

	it("returns an empty page when there are no job roles", async () => {
		findMany.mockResolvedValue([]);
		count.mockResolvedValue(0);

		const service = new JobRoleService();
		const result = await service.getJobRoles(1);

		expect(result.jobRoles).toEqual([]);
		expect(result.totalPages).toBe(0);
	});

	it("propagates errors thrown by the database query", async () => {
		findMany.mockRejectedValue(new Error("db error"));
		count.mockResolvedValue(0);

		const service = new JobRoleService();

		await expect(service.getJobRoles(1)).rejects.toThrow("db error");
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
