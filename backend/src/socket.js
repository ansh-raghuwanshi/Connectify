import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io = null;

export const initSocket = (server) => {
  const rawOrigin =
    process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "http://localhost:5173";
  const allowedOrigins = rawOrigin.includes(",")
    ? rawOrigin.split(",").map((s) => s.trim())
    : rawOrigin;

  io = new Server(server, {
    cors: {
      origin: allowedOrigins === "*" ? true : allowedOrigins,
      credentials: true,
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
  });

  io.use(async (socket, next) => {
    try {
      let token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token;

      if (!token && socket.handshake.headers?.cookie) {
        const cookies = socket.handshake.headers.cookie.split(";");
        for (const cookie of cookies) {
          const [key, val] = cookie.trim().split("=");
          if (key === "accessToken") {
            token = decodeURIComponent(val);
            break;
          }
        }
      }

      if (!token) {
        return next(new Error("Authentication token required for Socket connection"));
      }

      const secret =
        process.env.ACCESS_TOKEN_SECRET ||
        process.env.AccessTokenSecret ||
        "connectify_access_secret";

      const decoded = jwt.verify(token, secret);
      const userId = decoded.userId || decoded._id;

      if (!userId) {
        return next(new Error("Invalid token payload: userId missing"));
      }

      socket.userId = userId.toString();
      socket.user = decoded;
      return next();
    } catch (err) {
      console.warn(`[Socket.io Auth] Authentication error: ${err.message}`);
      return next(new Error(`Authentication failed: ${err.message}`));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    if (userId) {
      socket.join(userId);
      console.log(`[Socket.io] User ${userId} connected (Socket ID: ${socket.id})`);
    }

    socket.on("join_room", (room) => {
      if (room) {
        socket.join(room);
      }
    });

    socket.on("leave_room", (room) => {
      if (room) {
        socket.leave(room);
      }
    });

    socket.on("typing", ({ recipientId }) => {
      if (recipientId && userId) {
        io.to(recipientId.toString()).emit("user_typing", {
          senderId: userId,
        });
      }
    });

    socket.on("stop_typing", ({ recipientId }) => {
      if (recipientId && userId) {
        io.to(recipientId.toString()).emit("user_stop_typing", {
          senderId: userId,
        });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`[Socket.io] User ${userId || socket.id} disconnected (${reason})`);
    });
  });

  return io;
};

export const getIO = () => {
  return io;
};

export const emitToUser = (userId, event, data) => {
  if (io && userId) {
    io.to(userId.toString()).emit(event, data);
  }
};
