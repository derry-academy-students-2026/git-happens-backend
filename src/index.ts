import app from "./app";

// Start server
const PORT = 3000;

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
	console.log(`Health: http://localhost:${PORT}/health`);
});
