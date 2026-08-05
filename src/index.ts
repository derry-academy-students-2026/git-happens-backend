import express from "express";
<<<<<<< HEAD
import app from "./app.js";


const PORT = 3000;

=======

// Start server
const PORT = 3000;

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
    res.json({ status: "UP", timestamp: new Date().toISOString() });
});

>>>>>>> origin/main
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
	console.log(`Health: http://localhost:${PORT}/health`);
});
