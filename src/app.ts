// express app setup, middleware and routes only
import express from "express";
import morgan from "./config/morganMiddleware.js";
import logger from "./lib/logger.js";
import jobRoleRouter from "./routes/jobRoleRouter.js";
import capabilityRouter from "./routes/capabilityRouter.js";
import bandRouter from "./routes/bandRouter.js";

const app = express();


app.use(express.json());

//morgan logging for HTTP requests
app.use(morgan);
app.use("/capabilities", capabilityRouter);
app.use("/bands", bandRouter);

app.use("/job-roles", jobRoleRouter);

logger.error("Error level log");
logger.warn("This is a warning log message");
logger.info("This is an info log message");
logger.http("This is an HTTP log message");
logger.debug("This is a debug log message");

app.get("/health", (_req, res) => {
	res.json({ status: "OK", timestamp: new Date().toISOString() });
});


export default app;