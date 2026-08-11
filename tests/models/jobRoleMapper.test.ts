import { describe, expect, it } from "vitest";
import { mapJobRoleToModel, mapJobRoleToResponseModel } from "../../src/models/jobRoleMapper.js";
import { JobRoleModel, JobRoleResponseModel } from "../../src/models/jobRoleModels.js";
import { CapabilityModel } from "../../src/models/capabilityModels.js";
import { BandModel } from "../../src/models/bandModels.js";

const capability = new CapabilityModel(1, "Software Engineering");
const band = new BandModel(2, "Band 3 - Senior");
const closingDate = new Date("2024-09-30");

describe("mapJobRoleToResponseModel", () => {
	it("maps every field from JobRoleModel to JobRoleResponseModel", () => {
		const jobRole = new JobRoleModel(1, "Software Engineer", "Remote", capability, band, closingDate, "Open");

		const result = mapJobRoleToResponseModel(jobRole);

		expect(result).toEqual({
			jobRoleId: 1,
			roleName: "Software Engineer",
			location: "Remote",
			capability,
			band,
			closingDate,
			status: "Open",
		});
	});
});

describe("mapJobRoleToModel", () => {
	it("maps every field from JobRoleResponseModel back to JobRoleModel", () => {
		const jobRole = new JobRoleResponseModel(1, "Software Engineer", "Remote", capability, band, closingDate, "Open");

		const result = mapJobRoleToModel(jobRole);

		expect(result).toEqual({
			jobRoleId: 1,
			roleName: "Software Engineer",
			location: "Remote",
			capability,
			band,
			closingDate,
			status: "Open",
		});
	});
});
