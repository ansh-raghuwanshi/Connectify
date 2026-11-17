import express from "express";
import cors from "cors";

// Import route modules
import userRoutes from "./routes/user.routes.js";
import alumniRoutes from "./routes/alumni.routes.js";
import postRoutes from "./routes/post.routes.js";
import messageRoutes from "./routes/message.routes.js";
import eventRoutes from "./routes/event.routes.js";
import mentorshipRoutes from "./routes/mentorship.routes.js";
import aiRoutes from "./routes/ai.routes.js";

// Import error handler and utilities
import { errorHandler } from "./middleware/error.middleware.js";
import apiError from "./utils/apiError.js";

const app = express();

// Lightweight cookie parsing middleware
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

// CORS configuration
const allowedOrigin = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin: allowedOrigin === "*" ? true : allowedOrigin,
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Health check routes
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

// API Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/alumni", alumniRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/mentorship", mentorshipRoutes);
app.use("/api/v1/ai", aiRoutes);

// 404 Route Not Found handler
app.use((req, res, next) => {
  next(new apiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
