import { describe, expect, it } from "vitest";
import { BandModel } from "../../src/models/bandModels.js";
import { CapabilityModel } from "../../src/models/capabilityModels.js";
import {
	JobRoleDetailedResponseModel,
	JobRoleModel,
	JobRoleResponseModel,
} from "../../src/models/jobRoleModels.js";
import { StatusModel } from "../../src/models/statusModel.js";

const capability = new CapabilityModel(1, "Software Engineering");
const band = new BandModel(2, "Band 3 - Senior");
const status = new StatusModel(1, "Open");
const closingDate = new Date("2024-09-30");
const description = "Build software.";
const responsibilities = "Write code; review code.";
const sharepointUrl = "https://sharepoint.example.com/job-roles/1";

describe("JobRoleModel", () => {
	it("assigns constructor arguments to readonly properties", () => {
		const model = new JobRoleModel(
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
			3,
		);

		expect(model.jobRoleId).toBe(1);
		expect(model.roleName).toBe("Software Engineer");
		expect(model.location).toBe("Remote");
		expect(model.capability).toBe(capability);
		expect(model.band).toBe(band);
		expect(model.closingDate).toBe(closingDate);
		expect(model.status).toBe(status);
		expect(model.description).toBe(description);
		expect(model.responsibilities).toBe(responsibilities);
		expect(model.sharepointUrl).toBe(sharepointUrl);
		expect(model.numberOfOpenPositions).toBe(3);
	});
});

describe("JobRoleResponseModel", () => {
	it("assigns constructor arguments to readonly properties", () => {
		const model = new JobRoleResponseModel(
			1,
			"Software Engineer",
			"Remote",
			capability,
			band,
			closingDate,
			status,
		);

		expect(model.jobRoleId).toBe(1);
		expect(model.roleName).toBe("Software Engineer");
		expect(model.location).toBe("Remote");
		expect(model.capability).toBe(capability);
		expect(model.band).toBe(band);
		expect(model.closingDate).toBe(closingDate);
		expect(model.status).toBe(status);
	});
});

describe("JobRoleDetailedResponseModel", () => {
	it("assigns constructor arguments to readonly properties", () => {
		const model = new JobRoleDetailedResponseModel(
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
			3,
		);

		expect(model.jobRoleId).toBe(1);
		expect(model.roleName).toBe("Software Engineer");
		expect(model.location).toBe("Remote");
		expect(model.capability).toBe(capability);
		expect(model.band).toBe(band);
		expect(model.closingDate).toBe(closingDate);
		expect(model.status).toBe(status);
		expect(model.description).toBe(description);
		expect(model.responsibilities).toBe(responsibilities);
		expect(model.sharepointUrl).toBe(sharepointUrl);
		expect(model.numberOfOpenPositions).toBe(3);
	});
});
