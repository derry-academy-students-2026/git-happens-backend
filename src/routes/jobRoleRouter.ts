import { Router } from "express";
import { JobRolesController } from "../controllers/jobRoleController.js";
import { validateBody } from "../middleware/validateRequest.js";
import { JobRoleService } from "../services/jobRoleService.js";
import {
	CreateJobRoleSchema,
	UpdateJobRoleSchema,
} from "../validation/jobRoleSchemas.js";

const jobRoleRouter = Router();
const jobRoleService = new JobRoleService();
const jobRolesController = new JobRolesController(jobRoleService);

jobRoleRouter.post(
	"/",
	validateBody(CreateJobRoleSchema, "Invalid job role details"),
	(req, res, next) => jobRolesController.createJobRole(req, res, next),
);

jobRoleRouter.put(
	"/:id",
	validateBody(UpdateJobRoleSchema, "Invalid job role details"),
	(req, res, next) => jobRolesController.updateJobRole(req, res, next),
);

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

export default jobRoleRouter;
