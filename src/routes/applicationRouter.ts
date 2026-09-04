import { Router } from "express";
import { ApplicationController } from "../controllers/applicationController.js";
import {
	validateAuthenticatedUserId,
	validateBody,
	validateParams,
} from "../middleware/validateRequest.js";
import { ApplicationService } from "../services/applicationService.js";
import {
	ApplicationJobRoleIdParamSchema,
	ApplicationUserIdParamSchema,
	ApplyForRoleSchema,
} from "../validation/applicationSchemas.js";

const applicationRouter = Router();
const applicationService = new ApplicationService();
const applicationController = new ApplicationController(applicationService);

/**
 * Handles GET /users/:userId requests by listing that user's job applications.
 */
applicationRouter.get(
	"/users/:userId",
	validateParams(ApplicationUserIdParamSchema),
	validateAuthenticatedUserId(),
	(req, res) => applicationController.getApplicationsByUserId(req, res),
);

/**
 * Handles POST /job-roles/:jobRoleId requests by submitting an application.
 */
applicationRouter.post(
	"/job-roles/:jobRoleId",
	validateParams(ApplicationJobRoleIdParamSchema),
	validateAuthenticatedUserId(),
	validateBody(ApplyForRoleSchema, "Invalid application details"),
	(req, res) => applicationController.submitJobApplication(req, res),
);

applicationRouter.post(
	"/:jobRoleId/applications",
	validateParams(ApplicationJobRoleIdParamSchema),
	validateAuthenticatedUserId(),
	validateBody(ApplyForRoleSchema, "Invalid application details"),
	(req, res) => applicationController.submitJobApplication(req, res),
);

export default applicationRouter;
