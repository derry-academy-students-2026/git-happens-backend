import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

// The router constructs its own service, so the class is mocked and every
// instance shares this spy.
const serviceMocks = vi.hoisted(() => ({ getCapabilities: vi.fn() }));

vi.mock("../../src/services/capabilityService.js", () => ({
	CapabilityService: class {
		getCapabilities = serviceMocks.getCapabilities;
	},
}));

import capabilityRouter from "../../src/routes/capabilityRouter.js";

const { getCapabilities } = serviceMocks;

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
