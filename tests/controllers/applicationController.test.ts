import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { ApplicationController } from "../../src/controllers/applicationController.js";
import {
	ApplicationConflictError,
	ApplicationNotFoundError,
	ApplicationValidationError,
} from "../../src/errors/applicationErrors.js";
import type { ApplicationService } from "../../src/services/applicationService.js";

function createResponse(): Response {
	return {
		json: vi.fn(),
		status: vi.fn().mockReturnThis(),
		locals: { params: { jobRoleId: 2 }, authUserId: 7 },
	} as unknown as Response;
}

describe("ApplicationController.submitJobApplication", () => {
	it("responds with the created application", async () => {
		const submitJobApplication = vi.fn().mockResolvedValue({ applicationId: 1 });
		const controller = new ApplicationController({
			submitJobApplication,
		} as unknown as ApplicationService);
		const response = createResponse();

		await controller.submitJobApplication(
			{
				body: {
					fullName: "Jane Applicant",
					countryCode: "+44",
					phoneNumber: "7123 456 789",
					email: "jane@example.com",
					applicationText: "I am interested in this role.",
				},
			} as Request,
			response,
		);

		expect(submitJobApplication).toHaveBeenCalledWith(
			2,
			7,
			expect.objectContaining({ fullName: "Jane Applicant" }),
		);
		expect(response.status).toHaveBeenCalledWith(201);
	});

	it("returns the status from an application service error", async () => {
		const controller = new ApplicationController({
			submitJobApplication: vi
				.fn()
				.mockRejectedValue(new ApplicationNotFoundError("Job role not found")),
		} as unknown as ApplicationService);
		const response = createResponse();

		await controller.submitJobApplication(
			{ body: {} } as Request,
			response,
		);

		expect(response.status).toHaveBeenCalledWith(404);
		expect(response.json).toHaveBeenCalledWith({ message: "Job role not found" });
	});

	it("returns 400 and 409 for validation and conflict errors", async () => {
		const submitJobApplication = vi
			.fn()
			.mockRejectedValueOnce(
				new ApplicationValidationError("Invalid authenticated user"),
			)
			.mockRejectedValueOnce(
				new ApplicationConflictError("You have already applied for this role"),
			);
		const controller = new ApplicationController({
			submitJobApplication,
		} as unknown as ApplicationService);
		const response = createResponse();

		await controller.submitJobApplication({ body: {} } as Request, response);
		await controller.submitJobApplication({ body: {} } as Request, response);

		expect(response.status).toHaveBeenNthCalledWith(1, 400);
		expect(response.status).toHaveBeenNthCalledWith(2, 409);
	});

	it("returns 500 for unexpected service errors", async () => {
		const unexpectedError = new Error("Database unavailable");
		const controller = new ApplicationController({
			submitJobApplication: vi.fn().mockRejectedValue(unexpectedError),
		} as unknown as ApplicationService);
		const response = createResponse();

		await controller.submitJobApplication({ body: {} } as Request, response);

		expect(response.status).toHaveBeenCalledWith(500);
		expect(response.json).toHaveBeenCalledWith({ message: "Internal server error" });
	});
});

describe("ApplicationController.getApplicationsByUserId", () => {
	it("responds with applications for the authenticated user", async () => {
		const applications = [{ applicationId: 10, roleName: "Software Engineer" }];
		const getApplicationsByUserId = vi.fn().mockResolvedValue(applications);
		const controller = new ApplicationController({
			getApplicationsByUserId,
		} as unknown as ApplicationService);
		const response = createResponse();
		response.locals.params = { userId: 7 };

		await controller.getApplicationsByUserId({} as Request, response);

		expect(getApplicationsByUserId).toHaveBeenCalledWith(7);
		expect(response.json).toHaveBeenCalledWith(applications);
	});

	it("returns 403 without querying when the requested user is different", async () => {
		const getApplicationsByUserId = vi.fn();
		const controller = new ApplicationController({
			getApplicationsByUserId,
		} as unknown as ApplicationService);
		const response = createResponse();
		response.locals.params = { userId: 8 };

		await controller.getApplicationsByUserId({} as Request, response);

		expect(response.status).toHaveBeenCalledWith(403);
		expect(response.json).toHaveBeenCalledWith({ message: "Forbidden" });
		expect(getApplicationsByUserId).not.toHaveBeenCalled();
	});

	it("returns the status from an application service error", async () => {
		const controller = new ApplicationController({
			getApplicationsByUserId: vi
				.fn()
				.mockRejectedValue(new ApplicationValidationError("Invalid authenticated user")),
		} as unknown as ApplicationService);
		const response = createResponse();
		response.locals.params = { userId: 7 };

		await controller.getApplicationsByUserId({} as Request, response);

		expect(response.status).toHaveBeenCalledWith(400);
		expect(response.json).toHaveBeenCalledWith({
			message: "Invalid authenticated user",
		});
	});

	it("returns 500 for unexpected service errors", async () => {
		const controller = new ApplicationController({
			getApplicationsByUserId: vi.fn().mockRejectedValue(new Error("boom")),
		} as unknown as ApplicationService);
		const response = createResponse();
		response.locals.params = { userId: 7 };

		await controller.getApplicationsByUserId({} as Request, response);

		expect(response.status).toHaveBeenCalledWith(500);
		expect(response.json).toHaveBeenCalledWith({ message: "Internal server error" });
	});
});
