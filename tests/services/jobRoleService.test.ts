import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/prismaClient.js", () => ({
	default: {
		jobRole: {
			findMany: vi.fn(),
		},
	},
}));

import prisma from "../../src/prismaClient.js";
import { JobRoleService } from "../../src/services/jobRoleService.js";
import { CapabilityModel } from "../../src/models/capabilityModels.js";
import { BandModel } from "../../src/models/bandModels.js";

const findMany = prisma.jobRole.findMany as unknown as ReturnType<typeof vi.fn>;

const capability = new CapabilityModel(1, "Software Engineering");
const band = new BandModel(2, "Band 3 - Senior");
const closingDate = new Date("2024-09-30");

describe("JobRoleService.getJobRoles", () => {
	beforeEach(() => {
		findMany.mockReset();
	});

	it("queries job roles with their capability and band, mapped to response models", async () => {
		findMany.mockResolvedValue([
			{
				jobRoleId: 1,
				roleName: "Software Engineer",
				location: "Remote",
				capability: { capabilityId: 1, capabilityName: "Software Engineering" },
				band: { bandId: 2, bandName: "Band 3 - Senior" },
				closingDate,
				status: "Open",
			},
		]);

		const service = new JobRoleService();
		const result = await service.getJobRoles();

		expect(findMany).toHaveBeenCalledWith({ include: { capability: true, band: true } });
		expect(result).toEqual([
			{
				jobRoleId: 1,
				roleName: "Software Engineer",
				location: "Remote",
				capability,
				band,
				closingDate,
				status: "Open",
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
