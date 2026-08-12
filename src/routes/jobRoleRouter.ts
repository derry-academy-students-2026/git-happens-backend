import { Router } from "express";
import { JobRolesController } from "../controllers/jobRoleController.js";

const jobRoleRouter = Router();
const jobRolesController = new JobRolesController();

<<<<<<< HEAD
// GET / and GET /:id both currently return the full job role list
jobRoleRouter.get("/", (req, res, next) =>
	jobRolesController.getJobRoles(req, res, next),
);
jobRoleRouter.get("/:id", (req, res, next) =>
	jobRolesController.getJobRoles(req, res, next),
);
=======
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
>>>>>>> origin/main

export default jobRoleRouter;
