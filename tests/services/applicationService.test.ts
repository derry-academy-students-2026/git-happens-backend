import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/prismaClient.js", () => ({
	default: {
		jobRole: { findUnique: vi.fn() },
		jobApplication: { create: vi.fn() },
	},
}));

import {
	ApplicationConflictError,
	ApplicationNotFoundError,
} from "../../src/errors/applicationErrors.js";
import { ApplyForRoleRequestModel } from "../../src/models/jobApplicationModels.js";
import prisma from "../../src/prismaClient.js";
import { ApplicationService } from "../../src/services/applicationService.js";

const findUnique = prisma.jobRole.findUnique as unknown as ReturnType<typeof vi.fn>;
const create = prisma.jobApplication.create as unknown as ReturnType<typeof vi.fn>;
const request = new ApplyForRoleRequestModel(
	"Jane Applicant",
	"+44",
	"7123 456 789",
	"jane@example.com",
	"I am interested in this role.",
);

describe("ApplicationService.submitJobApplication", () => {
	beforeEach(() => {
		findUnique.mockReset();
		create.mockReset();
	});

	it("creates a submitted application for an open role", async () => {
		findUnique.mockResolvedValue({
			jobRoleId: 1,
			numberOfOpenPositions: 1,
			status: { statusName: "Open" },
		});
		create.mockResolvedValue({
			applicationId: 10,
			jobRoleId: 1,
			userId: 7,
			fullName: request.fullName,
			countryCode: request.countryCode,
			phoneNumber: request.phoneNumber,
			email: request.email,
			applicationText: request.applicationText,
			previousExperience: null,
			applicationStatus: "SUBMITTED",
			createdAt: new Date(),
		});

		const result = await new ApplicationService().submitJobApplication(1, 7, request);

		expect(create).toHaveBeenCalledWith({
			data: expect.objectContaining({ applicationStatus: "SUBMITTED" }),
		});
		expect(result.applicationStatus).toBe("SUBMITTED");
	});

	it("rejects an application for a missing role", async () => {
		findUnique.mockResolvedValue(null);

		await expect(
			new ApplicationService().submitJobApplication(1, 7, request),
		).rejects.toBeInstanceOf(ApplicationNotFoundError);
	});

	it("rejects an application for a closed role", async () => {
		findUnique.mockResolvedValue({
			jobRoleId: 1,
			numberOfOpenPositions: 1,
			status: { statusName: "Closed" },
		});

		await expect(
			new ApplicationService().submitJobApplication(1, 7, request),
		).rejects.toBeInstanceOf(ApplicationConflictError);
	});
});
