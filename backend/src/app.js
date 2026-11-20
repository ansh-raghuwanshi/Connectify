import express from "express";
import cors from "cors";

import userRoutes from "./routes/user.routes.js";
import alumniRoutes from "./routes/alumni.routes.js";
import postRoutes from "./routes/post.routes.js";
import messageRoutes from "./routes/message.routes.js";
import eventRoutes from "./routes/event.routes.js";
import mentorshipRoutes from "./routes/mentorship.routes.js";
import aiRoutes from "./routes/ai.routes.js";

import { errorHandler } from "./middleware/error.middleware.js";
import apiError from "./utils/apiError.js";

const app = express();

app.use((req, res, next) => {
  req.cookies = {};
  const cookieHeader = req.headers?.cookie;
  if (cookieHeader) {
    cookieHeader.split(";").forEach((cookie) => {
      const parts = cookie.split("=");
      const name = parts[0]?.trim();
      const val = parts.slice(1).join("=").trim();
      if (name) req.cookies[name] = decodeURIComponent(val);
    });
  }
  next();
});

const rawOrigin = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "http://localhost:5173";
const allowedOrigins = rawOrigin.includes(",")
  ? rawOrigin.split(",").map((s) => s.trim())
  : rawOrigin;

app.use(
  cors({
    origin: allowedOrigins === "*" ? true : allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Connectify Backend API is running",
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Health check passed",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/alumni", alumniRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/mentorship", mentorshipRoutes);
app.use("/api/v1/ai", aiRoutes);

app.use((req, res, next) => {
  next(new apiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
});

app.use(errorHandler);

export default app;
