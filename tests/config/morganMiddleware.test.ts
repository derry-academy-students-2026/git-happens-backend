import type { IncomingMessage, ServerResponse } from "node:http";
import { EventEmitter } from "node:events";
import { describe, expect, it } from "vitest";
import morganMiddleware from "../../src/config/morganMiddleware.js";

function createReqRes() {
	const req = new EventEmitter() as unknown as IncomingMessage;
	req.method = "GET";
	req.url = "/health";
	req.headers = {};

	const res = new EventEmitter() as unknown as ServerResponse;
	res.getHeader = () => undefined;
	res.setHeader = () => undefined;
	res.end = function end(this: ServerResponse) {
		this.emit("finish");
		return this;
	} as unknown as ServerResponse["end"];

	return { req, res };
}

describe("morganMiddleware", () => {
	it("is an express-compatible middleware function", () => {
		expect(typeof morganMiddleware).toBe("function");
		expect(morganMiddleware.length).toBe(3);
	});

	it("skips logging outside of development", async () => {
		const originalEnv = process.env.NODE_ENV;
		process.env.NODE_ENV = "production";

		await new Promise<void>((resolve, reject) => {
			const { req, res } = createReqRes();
			morganMiddleware(req, res, (err) => (err ? reject(err) : resolve()));
			res.end();
		});

		process.env.NODE_ENV = originalEnv;
	});

	it("logs requests during development", async () => {
		const originalEnv = process.env.NODE_ENV;
		process.env.NODE_ENV = "development";

		await new Promise<void>((resolve, reject) => {
			const { req, res } = createReqRes();
			morganMiddleware(req, res, (err) => (err ? reject(err) : resolve()));
			res.end();
		});

		process.env.NODE_ENV = originalEnv;
	});
});
