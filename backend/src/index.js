import dotenv from "dotenv";
dotenv.config();

import http from "http";
import connectDB from "./config/db.js";
import app from "./app.js";
import { initSocket } from "./socket.js";

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

initSocket(server);

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`[Connectify] Server is running on port ${PORT}`);
      console.log(`[Connectify] Base API URL: http://localhost:${PORT}/api/v1`);
      console.log(`[Connectify] Socket.IO real-time engine active`);
    });
  })
  .catch((error) => {
    console.error(`[Connectify] Startup Failed: ${error.message}`);
    process.exit(1);
  });
