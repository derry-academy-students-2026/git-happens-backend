import { z } from "zod";

export const ApplyForRoleSchema = z.object({
	fullName: z.string().trim().min(1, "Full name is required").max(120),
	countryCode: z
		.string()
		.trim()
		.regex(/^[+]\d{1,3}$/, "Country code must be in format +XXX (e.g., +44)"),
	phoneNumber: z
		.string()
		.trim()
		.min(6, "Phone number must be at least 6 characters")
		.max(20, "Phone number must be less than 20 characters")
		.regex(
			/^[0-9\s\-()]+$/,
			"Phone number can only contain numbers, spaces, hyphens, and parentheses",
		),
	email: z.string().trim().email("Email must be a valid email address"),
	applicationText: z
		.string()
		.trim()
		.min(1, "Application text is required")
		.max(5000, "Application text must be less than 5000 characters"),
	previousExperience: z
		.string()
		.trim()
		.max(3000, "Previous experience must be less than 3000 characters")
		.optional(),
});

export const ApplicationJobRoleIdParamSchema = z.object({
	jobRoleId: z.coerce
		.number({ error: "Job role ID is required" })
		.int("Job role ID must be a positive integer")
		.positive("Job role ID must be a positive integer"),
});

export type ApplyForRoleRequestDto = z.infer<typeof ApplyForRoleSchema>;
