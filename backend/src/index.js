import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import app from "./app.js";

const PORT = process.env.PORT || 3000;

// Connect to MongoDB Atlas connectify database then start HTTP server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[Connectify] Server is running on port ${PORT}`);
      console.log(`[Connectify] Base API URL: http://localhost:${PORT}/api/v1`);
    });
  })
  .catch((error) => {
    console.error(`[Connectify] Startup Failed: ${error.message}`);
    process.exit(1);
  });
