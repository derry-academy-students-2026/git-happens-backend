import { Router } from "express";
import { CapabilityController } from "../controllers/capabilityController.js";

const capabilityRouter = Router();
const capabilityController = new CapabilityController();

capabilityRouter.get("/", (req, res, next) =>
	capabilityController.getCapabilities(req, res, next),
);

export default capabilityRouter;
