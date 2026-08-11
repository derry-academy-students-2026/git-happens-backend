import Router from "express";
import { BandsController } from "../controllers/bandController.js";

const bandRouter = Router();
const bandsController = new BandsController();

bandRouter.get("/", (req, res, next) => bandsController.getBands(req, res, next));
bandRouter.get("/:id", (req, res, next) => bandsController.getBands(req, res, next));

export default bandRouter;
