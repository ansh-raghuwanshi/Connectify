import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function connectDB() {
  try {
    const rawUri = process.env.MONGODB_URI;
    if (!rawUri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    const dbName = process.env.DB_NAME || "connectify";

    const connectionInstance = await mongoose.connect(rawUri, {
      dbName: dbName,
    });

    const activeDb = connectionInstance.connection.name;
    const host = connectionInstance.connection.host;
    const nodeEnv = process.env.NODE_ENV || "development";

    console.log(`[MongoDB] Connected successfully!`);
    console.log(`[MongoDB] Active Database: ${activeDb}`);
    console.log(`[MongoDB] Cluster Host: ${host}`);
    console.log(`[MongoDB] Environment: ${nodeEnv}`);

    return connectionInstance;
  } catch (error) {
    console.error(`[MongoDB] Connection Failed: ${error.message}`);
    process.exit(1);
  }
}

export default connectDB;
