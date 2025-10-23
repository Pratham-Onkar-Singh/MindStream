import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URL: string = process.env.MONGO_URL ?? "";
if (!MONGO_URL) {
    throw new Error("MONGO_URL environment variable is not set.");
}

export const connectDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("✅ Connected to MongoDB!");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
}
