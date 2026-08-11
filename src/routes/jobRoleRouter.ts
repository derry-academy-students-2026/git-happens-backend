import Router from "express";
import { JobRolesController } from "../controllers/jobRoleController.js";

const jobRoleRouter = Router();
const jobRolesController = new JobRolesController();

// GET / and GET /:id both currently return the full job role list
jobRoleRouter.get("/", (req, res, next) =>
	jobRolesController.getJobRoles(req, res, next),
);
jobRoleRouter.get("/:id", (req, res, next) =>
	jobRolesController.getJobRoles(req, res, next),
);

export default jobRoleRouter;
