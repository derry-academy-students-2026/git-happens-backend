import express from "express";
import morgan from "./config/morganMiddleware.js";

const app = express();


app.use(express.json());

app.get("/health", (_req, res) => {
	res.json({ status: "OK", timestamp: new Date().toISOString() });
});

//morgan logging for HTTP requests
app.use(morgan);


export default app;