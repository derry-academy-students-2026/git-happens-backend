import { Router } from "express";
import { BandController } from "../controllers/bandController.js";
import { BandService } from "../services/bandService.js";

const bandRouter = Router();
const bandService = new BandService();
const bandController = new BandController(bandService);

bandRouter.get("/", (req, res, next) =>
	bandController.getBands(req, res, next),
);

export default bandRouter;
