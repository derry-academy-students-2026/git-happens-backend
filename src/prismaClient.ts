import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client.js";

// shared singleton client, reused across daos to avoid exhausting database connections
const prisma = new PrismaClient();

export default prisma;
