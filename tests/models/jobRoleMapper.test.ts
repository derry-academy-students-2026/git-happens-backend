import { describe, expect, it } from "vitest";
import { BandModel } from "../../src/models/bandModels.js";
import { CapabilityModel } from "../../src/models/capabilityModels.js";
import {
	mapJobRoleToDetailedResponseModel,
	mapJobRoleToResponseModel,
	mapPrismaJobRoleToModel,
} from "../../src/models/jobRoleMapper.js";
import { JobRoleModel } from "../../src/models/jobRoleModels.js";
import { StatusModel } from "../../src/models/statusModel.js";

const capability = new CapabilityModel(1, "Software Engineering");
const band = new BandModel(2, "Band 3 - Senior");
const status = new StatusModel(1, "Open");
const closingDate = new Date("2024-09-30");
const description = "Build software.";
const responsibilities = "Write code; review code.";
const sharepointUrl = "https://sharepoint.example.com/job-roles/1";
const numberOfOpenPositions = 3;

describe("mapJobRoleToResponseModel", () => {
	it("maps every field from JobRoleModel to JobRoleResponseModel", () => {
		const jobRole = new JobRoleModel(
			1,
			"Software Engineer",
			"Remote",
			capability,
			band,
			closingDate,
			status,
			description,
			responsibilities,
			sharepointUrl,
			numberOfOpenPositions,
		);

		const result = mapJobRoleToResponseModel(jobRole);

		expect(result).toEqual({
			jobRoleId: 1,
			roleName: "Software Engineer",
			location: "Remote",
			capability,
			band,
			closingDate,
			status,
		});
	});
});

describe("mapJobRoleToDetailedResponseModel", () => {
	it("maps every field from JobRoleModel to JobRoleDetailedResponseModel", () => {
		const jobRole = new JobRoleModel(
			1,
			"Software Engineer",
			"Remote",
			capability,
			band,
			closingDate,
			status,
			description,
			responsibilities,
			sharepointUrl,
			numberOfOpenPositions,
		);

		const result = mapJobRoleToDetailedResponseModel(jobRole);

		expect(result).toEqual({
			jobRoleId: 1,
			roleName: "Software Engineer",
			location: "Remote",
			capability,
			band,
			closingDate,
			status,
			description,
			responsibilities,
			sharepointUrl,
			numberOfOpenPositions,
		});
	});
});

describe("mapPrismaJobRoleToModel", () => {
	it("maps a Prisma row with its relations to a JobRoleModel", () => {
		const result = mapPrismaJobRoleToModel({
			jobRoleId: 1,
			roleName: "Software Engineer",
			location: "Remote",
			capabilityId: 1,
			capability: { capabilityId: 1, capabilityName: "Software Engineering" },
			bandId: 2,
			band: { bandId: 2, bandName: "Band 3 - Senior" },
			closingDate,
			statusId: 1,
			status: { statusId: 1, statusName: "Open" },
			description,
			responsibilities,
			sharepointUrl,
			numberOfOpenPositions,
		});

		expect(result).toEqual(
			new JobRoleModel(
				1,
				"Software Engineer",
				"Remote",
				capability,
				band,
				closingDate,
				status,
				description,
				responsibilities,
				sharepointUrl,
				numberOfOpenPositions,
			),
		);
	});
});
