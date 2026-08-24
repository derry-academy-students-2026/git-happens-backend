import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ZodType } from "zod";
import logger from "../lib/logger.js";
import { toFieldErrors } from "../validation/fieldErrors.js";

/**
 * Rejects the request with a 400 carrying field-level errors.
 * @param res - The Express response object.
 * @param message - The summary message for the failure.
 * @param errors - The per-field failures.
 */
function respondWithValidationErrors(
	res: Response,
	message: string,
	errors: ReturnType<typeof toFieldErrors>,
): void {
	logger.warn(
		`${message}: ${errors
			.map((fieldError) => `${fieldError.field} - ${fieldError.message}`)
			.join("; ")}`,
	);
	res.status(400).json({ message, errors });
}

/**
 * Validates `req.body` against a schema, replacing it with the parsed result.
 * Downstream handlers can therefore treat the body as already well-formed.
 * @param schema - The schema the body must satisfy.
 * @param message - Summary message returned alongside the field errors.
 * @returns Express middleware performing the validation.
 */
export function validateBody(
	schema: ZodType,
	message = "Invalid request body",
): RequestHandler {
	return (req: Request, res: Response, next: NextFunction): void => {
		const result = schema.safeParse(req.body);

		if (!result.success) {
			respondWithValidationErrors(res, message, toFieldErrors(result.error));
			return;
		}

		req.body = result.data;
		next();
	};
}

/**
 * Validates `req.params` against a schema, exposing the coerced values on
 * `res.locals.params` because Express treats `req.params` as read-only strings.
 * @param schema - The schema the path parameters must satisfy.
 * @param message - Summary message returned alongside the field errors.
 * @returns Express middleware performing the validation.
 */
export function validateParams(
	schema: ZodType,
	message = "Invalid request parameters",
): RequestHandler {
	return (req: Request, res: Response, next: NextFunction): void => {
		const result = schema.safeParse(req.params);

		if (!result.success) {
			respondWithValidationErrors(res, message, toFieldErrors(result.error));
			return;
		}

		res.locals.params = result.data;
		next();
	};
}
