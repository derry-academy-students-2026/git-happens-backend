//server bootstrap, listening only
import app from "./app.js";
import logger from "./lib/logger.js";

const PORT = 4000;

// starts the HTTP server and logs the listening address
app.listen(PORT, () => {
	logger.info(`Server running on http://localhost:${PORT}`);
	logger.info(`Health: http://localhost:${PORT}/health`);
});
