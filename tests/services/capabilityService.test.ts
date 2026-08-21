import { describe, expect, it, vi } from "vitest";

vi.mock("../../src/prismaClient.js", () => ({
	default: { capability: { findMany: vi.fn() } },
}));

import prisma from "../../src/prismaClient.js";
import { CapabilityService } from "../../src/services/capabilityService.js";

const findMany = prisma.capability.findMany as unknown as ReturnType<
	typeof vi.fn
>;

describe("CapabilityService", () => {
	it("returns capabilities ordered by name", async () => {
		findMany.mockResolvedValue([
			{ capabilityId: 2, capabilityName: "Testing" },
			{ capabilityId: 1, capabilityName: "Engineering" },
		]);

		const result = await new CapabilityService().getCapabilities();

		expect(findMany).toHaveBeenCalledWith({
			orderBy: { capabilityName: "asc" },
		});
		expect(result).toEqual([
			{ capabilityId: 2, capabilityName: "Testing" },
			{ capabilityId: 1, capabilityName: "Engineering" },
		]);
	});
});
