import { Router } from "express";
import { JobRolesController } from "../controllers/jobRoleController.js";
import { validateBody } from "../middleware/validateRequest.js";
import { JobRoleService } from "../services/jobRoleService.js";
import {
	JobRoleSchema,
	JobRoleSchema,
} from "../validation/jobRoleSchemas.js";

const jobRoleRouter = Router();
const jobRoleService = new JobRoleService();
const jobRolesController = new JobRolesController(jobRoleService);

jobRoleRouter.post(
	"/",
	validateBody(JobRoleSchema, "Invalid job role details"),
	(req, res) => jobRolesController.createJobRole(req, res),
);

jobRoleRouter.put(
	"/:id",
	validateBody(JobRoleSchema, "Invalid job role details"),
	(req, res) => jobRolesController.updateJobRole(req, res),
);

/**
 * Handles GET / requests.
 * Fetches a page of job roles (10 per page, selected via the `page` query param) and sends them in the response.
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function in the Express request-response cycle.
 */
jobRoleRouter.get("/", (req, res) =>
	jobRolesController.getJobRoles(req, res),
);

/**
 * Handles GET /:id requests.
 * Fetches the single job role identified by the `id` path parameter.
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function in the Express request-response cycle.
 */
jobRoleRouter.get("/:id", (req, res) =>
	jobRolesController.getJobRoleById(req, res),
);

export default jobRoleRouter;
