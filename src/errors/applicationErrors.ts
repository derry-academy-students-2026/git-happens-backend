export class ApplicationNotFoundError extends Error {
	readonly statusCode = 404;
}

export class ApplicationConflictError extends Error {
	readonly statusCode = 409;
}

export class ApplicationValidationError extends Error {
	readonly statusCode = 400;
}
