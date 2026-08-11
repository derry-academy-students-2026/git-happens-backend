import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/prismaClient.js", () => ({
	default: {
		jobRole: {
			findMany: vi.fn(),
		},
	},
}));

import prisma from "../../src/prismaClient.js";
import { JobRoleDao } from "../../src/daos/jobRoleDao.js";
import { JobRoleModel } from "../../src/models/jobRoleModels.js";
import { CapabilityModel } from "../../src/models/capabilityModels.js";
import { BandModel } from "../../src/models/bandModels.js";

const findMany = prisma.jobRole.findMany as unknown as ReturnType<typeof vi.fn>;

describe("JobRoleDao.getJobRoles", () => {
	beforeEach(() => {
		findMany.mockReset();
	});

	it("includes capability and band relations and maps the result to JobRoleModel instances", async () => {
		const closingDate = new Date("2024-09-30");
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

		const dao = new JobRoleDao();
		const result = await dao.getJobRoles();

		expect(findMany).toHaveBeenCalledWith({ include: { capability: true, band: true } });
		expect(result).toEqual([
			new JobRoleModel(
				1,
				"Software Engineer",
				"Remote",
				new CapabilityModel(1, "Software Engineering"),
				new BandModel(2, "Band 3 - Senior"),
				closingDate,
				"Open",
			),
		]);
	});

	it("returns an empty array when there are no job roles", async () => {
		findMany.mockResolvedValue([]);

		const dao = new JobRoleDao();
		const result = await dao.getJobRoles();

		expect(result).toEqual([]);
	});
});
