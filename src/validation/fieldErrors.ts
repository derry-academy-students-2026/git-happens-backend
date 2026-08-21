import type { ZodError } from "zod";

export interface FieldError {
	field: string;
	message: string;
}

/**
 * Flattens a Zod error into the field-level shape returned to API consumers.
 * @param error - The error produced by a failed `safeParse`.
 * @returns One entry per failed field, in the order Zod reported them.
 */
export function toFieldErrors(error: ZodError): FieldError[] {
	return error.issues.map((issue) => ({
		field: issue.path.join(".") || "body",
		message: issue.message,
	}));
}
