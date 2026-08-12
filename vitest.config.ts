import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
			include: ["src/**/*.ts"],
			exclude: [
				"src/generated/**",
				"src/index.ts",
				"src/dtos/**",
				"src/middleware/**",
			],
			thresholds: {
				lines: 80,
				statements: 80,
				functions: 80,
				branches: 70,
			},
		},
	},
});
