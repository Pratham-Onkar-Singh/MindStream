import dotenv from "dotenv";
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET ?? "";
export const MONGO_URL = process.env.MONGO_URL ?? "";
export const PORT = process.env.PORT || 3000;

// Validate required environment variables
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set.");
}

if (!MONGO_URL) {
    throw new Error("MONGO_URL environment variable is not set.");
}
