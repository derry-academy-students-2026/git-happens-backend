import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

vi.mock("../../src/lib/logger.js", () => ({
	default: {
		debug: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	},
}));

import {
	validateBody,
	validateParams,
} from "../../src/middleware/validateRequest.js";

const BodySchema = z.object({
	name: z.string().trim().min(1, "Name must not be empty"),
	count: z.coerce.number().int().positive("Count must be greater than zero"),
});

const ParamsSchema = z.object({
	id: z.coerce.number().int().positive("ID must be a positive integer"),
});

/**
 * Builds an app whose handlers echo back whatever the middleware produced.
 * @returns An Express application instance.
 */
function createApp() {
	const app = express();
	app.use(express.json());

	app.post("/items", validateBody(BodySchema), (req, res) => {
		res.status(200).json(req.body);
	});

	app.post(
		"/custom",
		validateBody(BodySchema, "Invalid item details"),
		(_req, res) => {
			res.status(200).json({ ok: true });
		},
	);

	app.get("/items/:id", validateParams(ParamsSchema), (_req, res) => {
		res.status(200).json(res.locals.params);
	});

	return app;
}

describe("validateBody", () => {
	it("passes a valid body through, replacing it with the parsed result", async () => {
		const response = await request(createApp())
			.post("/items")
			.send({ name: "  Widget  ", count: "3" });

		expect(response.status).toBe(200);
		expect(response.body).toEqual({ name: "Widget", count: 3 });
	});

	it("returns 400 with one entry per failed field", async () => {
		const response = await request(createApp())
			.post("/items")
			.send({ name: "   ", count: 0 });

		expect(response.status).toBe(400);
		expect(response.body.message).toBe("Invalid request body");
		expect(response.body.errors).toEqual(
			expect.arrayContaining([
				{ field: "name", message: "Name must not be empty" },
				{ field: "count", message: "Count must be greater than zero" },
			]),
		);
	});

	it("uses the caller's summary message when one is supplied", async () => {
		const response = await request(createApp()).post("/custom").send({});

		expect(response.status).toBe(400);
		expect(response.body.message).toBe("Invalid item details");
	});

	it("does not reach the handler when validation fails", async () => {
		const handler = vi.fn();
		const app = express();
		app.use(express.json());
		app.post("/items", validateBody(BodySchema), handler);

		await request(app).post("/items").send({});

		expect(handler).not.toHaveBeenCalled();
	});
});

describe("validateParams", () => {
	it("coerces valid params onto res.locals.params", async () => {
		const response = await request(createApp()).get("/items/42");

		expect(response.status).toBe(200);
		expect(response.body).toEqual({ id: 42 });
	});

	it("returns 400 for a non-numeric param", async () => {
		const response = await request(createApp()).get("/items/abc");

		expect(response.status).toBe(400);
		expect(response.body.message).toBe("Invalid request parameters");
		expect(response.body.errors[0].field).toBe("id");
	});
});
