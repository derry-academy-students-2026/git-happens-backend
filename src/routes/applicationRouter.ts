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
	ApplyForRoleSchema,
} from "../validation/applicationSchemas.js";

const applicationRouter = Router();
const applicationService = new ApplicationService();
const applicationController = new ApplicationController(applicationService);

/**
 * Handles POST /job-roles/:jobRoleId requests by submitting an application.
 */
applicationRouter.post(
	"/job-roles/:jobRoleId",
	validateParams(ApplicationJobRoleIdParamSchema),
	validateAuthenticatedUserId(),
	validateBody(ApplyForRoleSchema, "Invalid application details"),
	(req, res, next) => applicationController.submitJobApplication(req, res, next),
);

export default applicationRouter;
