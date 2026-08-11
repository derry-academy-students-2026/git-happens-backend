import { describe, expect, it } from "vitest";
import { JobRoleModel, JobRoleResponseModel } from "../../src/models/jobRoleModels.js";
import { CapabilityModel } from "../../src/models/capabilityModels.js";
import { BandModel } from "../../src/models/bandModels.js";

const capability = new CapabilityModel(1, "Software Engineering");
const band = new BandModel(2, "Band 3 - Senior");
const closingDate = new Date("2024-09-30");

describe("JobRoleModel", () => {
	it("assigns constructor arguments to readonly properties", () => {
		const model = new JobRoleModel(1, "Software Engineer", "Remote", capability, band, closingDate, "Open");

		expect(model.jobRoleId).toBe(1);
		expect(model.roleName).toBe("Software Engineer");
		expect(model.location).toBe("Remote");
		expect(model.capability).toBe(capability);
		expect(model.band).toBe(band);
		expect(model.closingDate).toBe(closingDate);
		expect(model.status).toBe("Open");
	});
});

describe("JobRoleResponseModel", () => {
	it("assigns constructor arguments to readonly properties", () => {
		const model = new JobRoleResponseModel(1, "Software Engineer", "Remote", capability, band, closingDate, "Open");

		expect(model.jobRoleId).toBe(1);
		expect(model.roleName).toBe("Software Engineer");
		expect(model.location).toBe("Remote");
		expect(model.capability).toBe(capability);
		expect(model.band).toBe(band);
		expect(model.closingDate).toBe(closingDate);
		expect(model.status).toBe("Open");
	});
});
