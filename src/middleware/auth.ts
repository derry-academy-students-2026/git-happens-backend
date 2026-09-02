import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import logger from "../lib/logger.js";

const LOGIN_PATH = "/login";
const AUTH_SCHEME = "Bearer ";

const ADMIN_ROLES = new Set(["admin"]);
const USER_ROLES = new Set(["user"]);
const READ_ONLY_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const USER_APPLICATION_PATH = /^\/applications\/job-roles\/\d+\/?$/;

interface AuthTokenPayload extends JwtPayload {
	sub: string;
	email: string;
	role: string;
	jti: string;
}

/**
 * Reads the JWT signing secret from environment variables.
 * @returns JWT secret string when configured, otherwise null.
 */
function getJwtSecret(): string | null {
	const secret = process.env.JWT_SECRET;
	if (!secret) {
		logger.error("JWT_SECRET environment variable is not set");
		return null;
	}

	return secret;
}

/**
 * Rejects unauthenticated requests with either a login redirect or JSON error.
 * @param req Incoming Express request.
 * @param res Outgoing Express response.
 */
function denyUnauthenticated(req: Request, res: Response): void {
	logger.warn("Authentication required for protected endpoint", {
		method: req.method,
		path: req.originalUrl,
	});

	const acceptHeader = req.header("accept")?.toLowerCase() ?? "";
	const expectsHtml =
		acceptHeader.includes("text/html") &&
		!acceptHeader.includes("application/json");

	if (expectsHtml) {
		res.redirect(302, LOGIN_PATH);
		return;
	}

	res.status(401).json({
		message: "Authentication required",
		redirectTo: LOGIN_PATH,
	});
}

/**
 * Extracts a bearer token from the Authorization header.
 * @param authorizationHeader Authorization header value.
 * @returns Parsed token when present, otherwise null.
 */
function parseBearerToken(
	authorizationHeader: string | undefined,
): string | null {
	if (!authorizationHeader?.startsWith(AUTH_SCHEME)) {
		return null;
	}

	const token = authorizationHeader.slice(AUTH_SCHEME.length).trim();
	return token.length > 0 ? token : null;
}

/**
 * Validates the JWT claim shape required by the application.
 * @param payload Decoded JWT payload.
 * @returns True when all required claims are present.
 */
function hasRequiredClaims(
	payload: JwtPayload | string,
): payload is AuthTokenPayload {
	if (typeof payload === "string") {
		return false;
	}

	return (
		typeof payload.sub === "string" &&
		typeof payload.email === "string" &&
		typeof payload.role === "string" &&
		typeof payload.jti === "string"
	);
}

/**
 * Checks whether the request is the applicant job-application submission path.
 */
function isUserApplicationSubmission(req: Request): boolean {
	return (
		req.method.toUpperCase() === "POST" && USER_APPLICATION_PATH.test(req.path)
	);
}

/**
 * Verifies JWT Bearer token and stores authenticated claims in response locals.
 */
export function authenticateToken(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	logger.debug("Authenticating request", {
		method: req.method,
		path: req.originalUrl,
	});

	const token = parseBearerToken(req.header("authorization"));
	if (!token) {
		denyUnauthenticated(req, res);
		return;
	}

	const secret = getJwtSecret();
	if (!secret) {
		res.status(500).json({ message: "Server configuration error" });
		return;
	}

	try {
		const payload = jwt.verify(token, secret);
		if (!hasRequiredClaims(payload)) {
			logger.warn("Token missing required claims", {
				method: req.method,
				path: req.originalUrl,
			});
			res.status(401).json({
				message: "Invalid authentication token",
				redirectTo: LOGIN_PATH,
			});
			return;
		}

		res.locals.auth = {
			token,
			sub: payload.sub,
			email: payload.email,
			role: payload.role,
			jti: payload.jti,
		};

		logger.debug("Authentication successful", {
			method: req.method,
			path: req.originalUrl,
			role: payload.role,
		});

		next();
	} catch {
		logger.warn("Invalid or expired token", {
			method: req.method,
			path: req.originalUrl,
		});
		res.status(401).json({
			message: "Invalid or expired token",
			redirectTo: LOGIN_PATH,
		});
	}
}

/**
 * Grants full access to admins and read-only access to users.
 */
export function authorizeRecruitmentAccess(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	const role = String(res.locals.auth?.role ?? "").toLowerCase();

	if (ADMIN_ROLES.has(role)) {
		logger.debug("Authorization granted: admin access", {
			method: req.method,
			path: req.originalUrl,
			role,
		});
		next();
		return;
	}

	if (USER_ROLES.has(role)) {
		if (
			READ_ONLY_METHODS.has(req.method.toUpperCase()) ||
			isUserApplicationSubmission(req)
		) {
			logger.debug("Authorization granted: user read-only access", {
				method: req.method,
				path: req.originalUrl,
				role,
			});
			next();
			return;
		}

		logger.warn("Authorization denied: user attempted write access", {
			method: req.method,
			path: req.originalUrl,
			role,
		});
		res.status(403).json({
			message:
				"Users can only access list/info endpoints and submit job applications",
		});
		return;
	}

	logger.warn("Authorization denied: unknown role", {
		method: req.method,
		path: req.originalUrl,
		role,
	});
	res.status(403).json({ message: "Insufficient permissions" });
}
