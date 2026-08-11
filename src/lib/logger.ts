import fs from "node:fs";
import winston from "winston";

fs.mkdirSync("logs", { recursive: true });
const levels = {
	error: 0,
	warn: 1,
	info: 2,
	http: 3,
	debug: 4,
};

const colours = {
	error: "red",
	warn: "yellow",
	info: "green",
	http: "magenta",
	debug: "blue",
};

winston.addColors(colours);

//production = warn
//development = debug
const level = () => {
	const env = process.env.NODE_ENV || "development";
	const isDevelopment = env === "development";
	return isDevelopment ? "debug" : "warn";
};

const format = winston.format.combine(
	winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
	winston.format.colorize({ all: true }),
	winston.format.printf(
		(info) => `${info.timestamp} ${info.level}: ${info.message}`,
	),
);

const transport = [
	new winston.transports.Console(),
	new winston.transports.File({ filename: "logs/error.log", level: "error" }),
	new winston.transports.File({ filename: "logs/all.log" }),
];

const logger = winston.createLogger({
	level: level(),
	levels,
	format,
	transports: transport,
});

export default logger;
