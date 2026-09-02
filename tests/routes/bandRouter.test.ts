import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

// The router constructs its own service, so the class is mocked and every
// instance shares this spy.
const serviceMocks = vi.hoisted(() => ({ getBands: vi.fn() }));

vi.mock("../../src/services/bandService.js", () => ({
	BandService: class {
		getBands = serviceMocks.getBands;
	},
}));

import bandRouter from "../../src/routes/bandRouter.js";

const { getBands } = serviceMocks;

function createApp() {
	const app = express();
	app.use("/bands", bandRouter);
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

describe("bandRouter", () => {
	beforeEach(() => getBands.mockReset());

	it("returns bands", async () => {
		getBands.mockResolvedValue([{ bandId: 1, bandName: "Band 1 - Junior" }]);

		const response = await request(createApp()).get("/bands");

		expect(response.status).toBe(200);
		expect(response.body).toEqual([{ bandId: 1, bandName: "Band 1 - Junior" }]);
	});
});
