//server bootstrap, listening only
import app from "./app.js";

// Start server
const PORT = 4000;

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
	console.log(`Health: http://localhost:${PORT}/health`);
});
