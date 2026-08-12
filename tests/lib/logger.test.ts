import { describe, expect, it, vi } from "vitest";
import logger from "../../src/lib/logger.js";

describe("logger", () => {
	it("exposes a logging method for each configured level", () => {
		expect(typeof logger.error).toBe("function");
		expect(typeof logger.warn).toBe("function");
		expect(typeof logger.info).toBe("function");
		expect(typeof logger.http).toBe("function");
		expect(typeof logger.debug).toBe("function");
	});

	it("logs messages without throwing", () => {
		expect(() => logger.info("test log message")).not.toThrow();
	});

	it("uses the debug level in development", async () => {
		const originalEnv = process.env.NODE_ENV;
		process.env.NODE_ENV = "development";
		vi.resetModules();

		const { default: devLogger } = await import("../../src/lib/logger.js");
		expect(devLogger.level).toBe("debug");

		process.env.NODE_ENV = originalEnv;
		vi.resetModules();
	});

	it("uses the warn level outside of development", async () => {
		const originalEnv = process.env.NODE_ENV;
		process.env.NODE_ENV = "production";
		vi.resetModules();

		const { default: prodLogger } = await import("../../src/lib/logger.js");
		expect(prodLogger.level).toBe("warn");

		process.env.NODE_ENV = originalEnv;
		vi.resetModules();
	});
});
