import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/prismaClient.js", () => ({
	default: {
		jobRole: { findUnique: vi.fn() },
		jobApplication: { create: vi.fn(), findMany: vi.fn() },
	},
}));

import {
	ApplicationConflictError,
	ApplicationNotFoundError,
	ApplicationValidationError,
} from "../../src/errors/applicationErrors.js";
import { ApplyForRoleRequestModel } from "../../src/models/jobApplicationModels.js";
import prisma from "../../src/prismaClient.js";
import { ApplicationService } from "../../src/services/applicationService.js";

const findUnique = prisma.jobRole.findUnique as unknown as ReturnType<typeof vi.fn>;
const create = prisma.jobApplication.create as unknown as ReturnType<typeof vi.fn>;
const findMany = prisma.jobApplication.findMany as unknown as ReturnType<
	typeof vi.fn
>;
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
			applicationStatus: "IN_PROGRESS",
			createdAt: new Date(),
		});

		const result = await new ApplicationService().submitJobApplication(1, 7, request);

		expect(create).toHaveBeenCalledWith({
			data: expect.objectContaining({ applicationStatus: "IN_PROGRESS" }),
		});
		expect(result.applicationStatus).toBe("IN_PROGRESS");
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

	it("rejects an application when no positions remain", async () => {
		findUnique.mockResolvedValue({
			jobRoleId: 1,
			numberOfOpenPositions: 0,
			status: { statusName: "Open" },
		});

		await expect(
			new ApplicationService().submitJobApplication(1, 7, request),
		).rejects.toBeInstanceOf(ApplicationConflictError);
	});

	it("rejects invalid job role and user IDs before querying Prisma", async () => {
		const service = new ApplicationService();

		await expect(
			service.submitJobApplication(0, 7, request),
		).rejects.toBeInstanceOf(ApplicationValidationError);
		await expect(
			service.submitJobApplication(1, 0, request),
		).rejects.toBeInstanceOf(ApplicationValidationError);
		expect(findUnique).not.toHaveBeenCalled();
	});

	it("converts a duplicate application database error into a conflict", async () => {
		findUnique.mockResolvedValue({
			jobRoleId: 1,
			numberOfOpenPositions: 1,
			status: { statusName: "Open" },
		});
		create.mockRejectedValue({ code: "P2002" });

		await expect(
			new ApplicationService().submitJobApplication(1, 7, request),
		).rejects.toBeInstanceOf(ApplicationConflictError);
	});

	it("rethrows unexpected persistence errors", async () => {
		findUnique.mockResolvedValue({
			jobRoleId: 1,
			numberOfOpenPositions: 1,
			status: { statusName: "Open" },
		});
		const unexpectedError = new Error("Database unavailable");
		create.mockRejectedValue(unexpectedError);

		await expect(
			new ApplicationService().submitJobApplication(1, 7, request),
		).rejects.toBe(unexpectedError);
	});

	it("stores blank previous experience as null and retains meaningful text", async () => {
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
		const service = new ApplicationService();

		await service.submitJobApplication(
			1,
			7,
			new ApplyForRoleRequestModel(
				request.fullName,
				request.countryCode,
				request.phoneNumber,
				request.email,
				request.applicationText,
				"   ",
			),
		);
		expect(create).toHaveBeenLastCalledWith({
			data: expect.objectContaining({ previousExperience: null }),
		});

		await service.submitJobApplication(
			1,
			7,
			new ApplyForRoleRequestModel(
				request.fullName,
				request.countryCode,
				request.phoneNumber,
				request.email,
				request.applicationText,
				"Five years of relevant experience",
			),
		);
		expect(create).toHaveBeenLastCalledWith({
			data: expect.objectContaining({
				previousExperience: "Five years of relevant experience",
			}),
		});
	});
});

describe("ApplicationService.getApplicationsByUserId", () => {
	beforeEach(() => {
		findMany.mockReset();
	});

	it("lists the user's applications, most recent first, with role details", async () => {
		findMany.mockResolvedValue([
			{
				applicationId: 10,
				jobRoleId: 1,
				applicationStatus: "IN_PROGRESS",
				createdAt: new Date("2026-08-14T00:00:00.000Z"),
				jobRole: { roleName: "Software Engineer", location: "Remote" },
			},
		]);

		const result = await new ApplicationService().getApplicationsByUserId(7);

		expect(findMany).toHaveBeenCalledWith({
			where: { userId: 7 },
			include: { jobRole: true },
			orderBy: { createdAt: "desc" },
		});
		expect(result).toEqual([
			{
				applicationId: 10,
				jobRoleId: 1,
				roleName: "Software Engineer",
				location: "Remote",
				applicationStatus: "IN_PROGRESS",
				createdAt: new Date("2026-08-14T00:00:00.000Z"),
			},
		]);
	});

	it("returns an empty list when the user has no applications", async () => {
		findMany.mockResolvedValue([]);

		const result = await new ApplicationService().getApplicationsByUserId(7);

		expect(result).toEqual([]);
	});

	it("rejects an invalid user ID before querying Prisma", async () => {
		await expect(
			new ApplicationService().getApplicationsByUserId(0),
		).rejects.toBeInstanceOf(ApplicationValidationError);
		expect(findMany).not.toHaveBeenCalled();
	});
});
