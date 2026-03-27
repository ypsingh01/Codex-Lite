import type { Server, Socket } from "socket.io";
import { Interview } from "../models/Interview";

type ChatMessagePayload = {
  roomId: string;
  senderName: string;
  message: string;
  timestamp: string;
};

async function verifyBelongsToRoom(roomId: string, userId: string) {
  const interview = await Interview.findOne({ roomId }).lean();
  if (!interview) return { ok: false as const, error: "Interview not found" };
  const allowed =
    interview.candidateId.toString() === userId ||
    interview.interviewerId.toString() === userId;
  if (!allowed) return { ok: false as const, error: "Forbidden" };
  return { ok: true as const };
}

export function registerChatSocket(io: Server, socket: Socket) {
  socket.on("chat-message", async (payload: ChatMessagePayload) => {
    const authed = socket.data.user;
    if (!authed) return;
    const check = await verifyBelongsToRoom(payload.roomId, authed.id);
    if (!check.ok) return;

    io.to(payload.roomId).emit("chat-message", {
      senderName: payload.senderName,
      message: payload.message,
      timestamp: payload.timestamp,
    });
  });
}

