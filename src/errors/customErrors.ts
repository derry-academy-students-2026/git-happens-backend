/**
 * Application error types that carry the HTTP status code they should surface as.
 * Controllers translate these into responses; anything else is a genuine 500.
 */

/** Base class for errors that map onto a specific HTTP status code. */
export abstract class AppError extends Error {
	constructor(
		message: string,
		public readonly statusCode: number,
	) {
		super(message);
		this.name = new.target.name;
	}
}

/** A job role request referenced data that does not exist or is otherwise invalid. */
export class JobRoleValidationError extends AppError {
	constructor(message: string, statusCode = 400) {
		super(message, statusCode);
	}
}
