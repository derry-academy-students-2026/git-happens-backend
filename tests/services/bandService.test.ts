import { describe, expect, it, vi } from "vitest";

vi.mock("../../src/prismaClient.js", () => ({
	default: { band: { findMany: vi.fn() } },
}));

import prisma from "../../src/prismaClient.js";
import { BandService } from "../../src/services/bandService.js";

const findMany = prisma.band.findMany as unknown as ReturnType<typeof vi.fn>;

describe("BandService", () => {
	it("returns bands ordered by name", async () => {
		findMany.mockResolvedValue([
			{ bandId: 2, bandName: "Band 3 - Senior" },
			{ bandId: 1, bandName: "Band 1 - Junior" },
		]);

		const result = await new BandService().getBands();

		expect(findMany).toHaveBeenCalledWith({
			orderBy: { bandName: "asc" },
		});
		expect(result).toEqual([
			{ bandId: 2, bandName: "Band 3 - Senior" },
			{ bandId: 1, bandName: "Band 1 - Junior" },
		]);
	});
});
