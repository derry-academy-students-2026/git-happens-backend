// express app setup, middleware and routes only
import express from "express";
import morgan from "./config/morganMiddleware.js";
import logger from "./lib/logger.js";
import {
	authenticateToken,
	authorizeRecruitmentAccess,
} from "./middleware/auth.js";
import authRouter from "./routes/authRouter.js";
import applicationRouter from "./routes/applicationRouter.js";
import bandRouter from "./routes/bandRouter.js";
import capabilityRouter from "./routes/capabilityRouter.js";
import jobRoleRouter from "./routes/jobRoleRouter.js";

const app = express();

app.use(express.json());

//morgan logging for HTTP requests
app.use(morgan);

app.use("/auth", authRouter);
app.use(
	"/capabilities",
	authenticateToken,
	authorizeRecruitmentAccess,
	capabilityRouter,
);
app.use("/bands", authenticateToken, authorizeRecruitmentAccess, bandRouter);
app.use(
	"/job-roles",
	authenticateToken,
	authorizeRecruitmentAccess,
	jobRoleRouter,
);
app.use(
	"/applications",
	authenticateToken,
	authorizeRecruitmentAccess,
	applicationRouter,
);

logger.info("Express app initialized");

// simple liveness check, used by uptime monitors and the test suite
app.get("/health", (_req, res) => {
	res.json({ status: "OK", timestamp: new Date().toISOString() });
});

export default app;
