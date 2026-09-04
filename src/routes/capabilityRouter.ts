import { Router } from "express";
import { CapabilityController } from "../controllers/capabilityController.js";
import { CapabilityService } from "../services/capabilityService.js";

const capabilityRouter = Router();
const capabilityService = new CapabilityService();
const capabilityController = new CapabilityController(capabilityService);

capabilityRouter.get("/", (req, res) =>
	capabilityController.getCapabilities(req, res),
);

export default capabilityRouter;
