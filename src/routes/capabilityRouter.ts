import Router from "express";
import { CapabilitiesController } from "../controllers/capabilityController.js";

const capabilityRouter = Router();
const capabilitiesController = new CapabilitiesController();

capabilityRouter.get("/", (req, res, next) => capabilitiesController.getCapabilities(req, res, next));
capabilityRouter.get("/:id", (req, res, next) => capabilitiesController.getCapabilities(req, res, next));

export default capabilityRouter;
