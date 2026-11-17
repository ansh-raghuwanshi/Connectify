import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables immediately
dotenv.config();

/**
 * Connect to MongoDB Atlas
 * Ensures the target database is strictly 'connectify' (or process.env.DB_NAME)
 * and never falls back to the default 'test' database.
 */
async function connectDB() {
  try {
    const rawUri = process.env.MONGODB_URI;
    if (!rawUri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    const dbName = process.env.DB_NAME || "connectify";

    // Cleanly construct URI and pass explicit dbName in options
    // Mongoose dbName option guarantees the database used regardless of URI query parameters
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
