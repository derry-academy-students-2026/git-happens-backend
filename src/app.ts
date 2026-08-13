// express app setup, middleware and routes only
import express from "express";
import morgan from "./config/morganMiddleware.js";
import logger from "./lib/logger.js";
import jobRoleRouter from "./routes/jobRoleRouter.js";
import authRouter from "./routes/authRouter.js";

const app = express();

app.use(express.json());

//morgan logging for HTTP requests
app.use(morgan);

app.use("/job-roles", jobRoleRouter);
app.use("/auth", authRouter);

logger.info("Express app initialized");

// simple liveness check, used by uptime monitors and the test suite
app.get("/health", (_req, res) => {
	res.json({ status: "OK", timestamp: new Date().toISOString() });
});

export default app;
