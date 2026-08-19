import { Router } from "express";
import { BandController } from "../controllers/bandController.js";

const bandRouter = Router();
const bandController = new BandController();

bandRouter.get("/", (req, res, next) =>
	bandController.getBands(req, res, next),
);

export default bandRouter;
