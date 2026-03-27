import type http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import type { JwtUser } from "../middleware/auth.middleware";
import { registerEditorSocket } from "./editor.socket";
import { registerChatSocket } from "./chat.socket";

declare module "socket.io" {
  interface SocketData {
    user?: JwtUser;
    roomId?: string;
  }
}

export function initSockets(server: http.Server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = (socket.handshake.auth as { token?: string } | undefined)?.token;
    if (!token) return next(new Error("Unauthorized"));
    try {
      const secret = process.env.JWT_SECRET || "";
      if (!secret) return next(new Error("Unauthorized"));
      const decoded = jwt.verify(token, secret) as JwtUser;
      socket.data.user = decoded;
      return next();
    } catch {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    registerEditorSocket(io, socket);
    registerChatSocket(io, socket);
  });

  return io;
}

