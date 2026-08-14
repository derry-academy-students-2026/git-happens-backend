import { Router } from "express";
import { JobRolesController } from "../controllers/jobRoleController.js";

const jobRoleRouter = Router();
const jobRolesController = new JobRolesController();

/**
 * Handles GET / requests.
 * Fetches all job roles from the controller and sends them in the response.
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function in the Express request-response cycle.
 */
jobRoleRouter.get("/", (req, res, next) =>
	jobRolesController.getJobRoles(req, res, next),
);

/**
 * Handles GET /:id requests.
 * Fetches the single job role identified by the `id` path parameter.
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function in the Express request-response cycle.
 */
jobRoleRouter.get("/:id", (req, res, next) =>
	jobRolesController.getJobRoleById(req, res, next),
);

/**
 * Handles POST /:id/applications requests.
 * Submits an authenticated applicant's job application for the specified role.
 */
jobRoleRouter.post("/:id/applications", (req, res, next) =>
	jobRolesController.applyForRole(req, res, next),
);

export default jobRoleRouter;
