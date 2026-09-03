import { z } from "zod";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const END_OF_DAY_OFFSET_MS = 24 * 60 * 60 * 1000 - 1;

/**
 * Converts a submitted closing date into the instant the role actually closes.
 * A date-only value is taken as the end of that day in UTC, so a role closing
 * today stays open for the rest of the day instead of being rejected as past.
 * @param value - The closing date string from the request body.
 * @returns The resolved closing date.
 */
function parseClosingDate(value: string): Date {
	if (DATE_ONLY_PATTERN.test(value)) {
		return new Date(Date.parse(value) + END_OF_DAY_OFFSET_MS);
	}

	return new Date(value);
}

const requiredText = (field: string) =>
	z
		.string({ error: `${field} is required` })
		.trim()
		.min(1, `${field} must not be empty`);

const positiveId = (field: string) =>
	z
		.number({ error: `${field} is required` })
		.int(`${field} must be a whole number`)
		.positive(`${field} must be greater than zero`);

// Parsed to a Date here so every downstream layer works with a Date, never a string.
const futureClosingDate = z
	.string({ error: "Closing date is required" })
	.refine((value) => !Number.isNaN(Date.parse(value)), {
		message: "Closing date must be a valid date",
	})
	.transform(parseClosingDate)
	.refine((date) => date.getTime() > Date.now(), {
		message: "Closing date must be in the future",
	});

export const CreateJobRoleSchema = z.object({
	roleName: requiredText("Role name"),
	location: requiredText("Location"),
	capabilityId: positiveId("Capability ID"),
	bandId: positiveId("Band ID"),
	closingDate: futureClosingDate,
	description: requiredText("Description"),
	responsibilities: requiredText("Responsibilities"),
	numberOfOpenPositions: positiveId("Number of open positions"),
});

export const UpdateJobRoleSchema = CreateJobRoleSchema;

export const JobRoleIdParamSchema = z.object({
	id: z.coerce
		.number({ error: "ID is required" })
		.int("ID must be a positive integer")
		.positive("ID must be a positive integer"),
});

export type CreateJobRoleRequestDto = z.infer<typeof CreateJobRoleSchema>;
export type UpdateJobRoleRequestDto = z.infer<typeof UpdateJobRoleSchema>;
export type JobRoleIdParamDto = z.infer<typeof JobRoleIdParamSchema>;
