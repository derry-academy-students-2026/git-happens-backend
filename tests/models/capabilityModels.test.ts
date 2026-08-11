import { describe, expect, it } from "vitest";
import {
	CapabilityModel,
	CapabilityResponseModel,
} from "../../src/models/capabilityModels.js";

describe("CapabilityModel", () => {
	it("assigns constructor arguments to readonly properties", () => {
		const model = new CapabilityModel(1, "Software Engineering");

		expect(model.capabilityId).toBe(1);
		expect(model.capabilityName).toBe("Software Engineering");
	});
});

describe("CapabilityResponseModel", () => {
	it("assigns constructor arguments to readonly properties", () => {
		const model = new CapabilityResponseModel(1, "Software Engineering");

		expect(model.capabilityId).toBe(1);
		expect(model.capabilityName).toBe("Software Engineering");
	});
});
