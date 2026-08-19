import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/services/capabilityService.js", () => ({
	capabilityService: { getCapabilities: vi.fn() },
}));

import capabilityRouter from "../../src/routes/capabilityRouter.js";
import { capabilityService } from "../../src/services/capabilityService.js";

const getCapabilities =
	capabilityService.getCapabilities as unknown as ReturnType<typeof vi.fn>;

function createApp() {
	const app = express();
	app.use("/capabilities", capabilityRouter);
	app.use(
		(
			err: unknown,
			_req: express.Request,
			res: express.Response,
			_next: express.NextFunction,
		) => {
			res.status(500).json({ message: (err as Error).message });
		},
	);
	return app;
}

describe("capabilityRouter", () => {
	beforeEach(() => getCapabilities.mockReset());

	it("returns capabilities", async () => {
		getCapabilities.mockResolvedValue([
			{ capabilityId: 1, capabilityName: "Engineering" },
		]);

		const response = await request(createApp()).get("/capabilities");

		expect(response.status).toBe(200);
		expect(response.body).toEqual([
			{ capabilityId: 1, capabilityName: "Engineering" },
		]);
	});
});
