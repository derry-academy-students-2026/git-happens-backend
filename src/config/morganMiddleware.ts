import morgan, { type StreamOptions } from "morgan";
import logger from "../lib/logger.js";

// routes morgan's HTTP log lines through winston's http level
const stream: StreamOptions = {
	write: (message) => logger.http(message.trimEnd()),
};

// only log HTTP requests in development
const skip = () => {
	const env = process.env.NODE_ENV || "development";
	return env !== "development";
};

const morganMiddleware = morgan(
	`:method :url :status :res[content-length] - :response-time ms`,
	{ stream, skip },
);

export default morganMiddleware;
