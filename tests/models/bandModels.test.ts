import { describe, expect, it } from "vitest";
import { BandModel, BandResponseModel } from "../../src/models/bandModels.js";

describe("BandModel", () => {
	it("assigns constructor arguments to readonly properties", () => {
		const model = new BandModel(2, "Band 3 - Senior");

		expect(model.bandId).toBe(2);
		expect(model.bandName).toBe("Band 3 - Senior");
	});
});

describe("BandResponseModel", () => {
	it("assigns constructor arguments to readonly properties", () => {
		const model = new BandResponseModel(2, "Band 3 - Senior");

		expect(model.bandId).toBe(2);
		expect(model.bandName).toBe("Band 3 - Senior");
	});
});
