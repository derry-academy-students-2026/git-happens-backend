import { describe, expect, it, vi } from "vitest";
import { JobRoleService } from "../../src/services/jobRoleService.js";
import type { JobRoleDao } from "../../src/daos/jobRoleDao.js";
import { JobRoleModel } from "../../src/models/jobRoleModels.js";
import { CapabilityModel } from "../../src/models/capabilityModels.js";
import { BandModel } from "../../src/models/bandModels.js";

const capability = new CapabilityModel(1, "Software Engineering");
const band = new BandModel(2, "Band 3 - Senior");
const closingDate = new Date("2024-09-30");
const jobRole = new JobRoleModel(
	1,
	"Software Engineer",
	"Remote",
	capability,
	band,
	closingDate,
	"Open",
);

function createFakeDao(
	getJobRoles = vi.fn().mockResolvedValue([jobRole]),
): JobRoleDao {
	return { getJobRoles } as unknown as JobRoleDao;
}

describe("JobRoleService", () => {
	it("returns job roles mapped to response models", async () => {
		const fakeDao = createFakeDao();
		const service = new JobRoleService(fakeDao);

		const result = await service.getJobRoles();

		expect(fakeDao.getJobRoles).toHaveBeenCalledTimes(1);
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

	it("propagates errors thrown by the DAO", async () => {
		const fakeDao = createFakeDao(
			vi.fn().mockRejectedValue(new Error("db error")),
		);
		const service = new JobRoleService(fakeDao);

		await expect(service.getJobRoles()).rejects.toThrow("db error");
	});
});
