import type { Server, Socket } from "socket.io";
import { Interview } from "../models/Interview";

type JoinRoomPayload = { roomId: string; userId: string; role: string };
type LeaveRoomPayload = { roomId: string };
type CodeChangePayload = { roomId: string; code: string; language: string };
type CursorMovePayload = { roomId: string; userId: string; line: number; col: number };
type StartEndPayload = { roomId: string };

async function verifyBelongsToRoom(roomId: string, userId: string) {
  const interview = await Interview.findOne({ roomId }).lean();
  if (!interview) return { ok: false as const, error: "Interview not found" };
  const allowed =
    interview.candidateId.toString() === userId ||
    interview.interviewerId.toString() === userId;
  if (!allowed) return { ok: false as const, error: "Forbidden" };
  return { ok: true as const, interview };
}

export function registerEditorSocket(io: Server, socket: Socket) {
  socket.on("join-room", async (payload: JoinRoomPayload) => {
    const authed = socket.data.user;
    if (!authed) return socket.disconnect();
    if (payload.userId !== authed.id) return socket.disconnect();

    const check = await verifyBelongsToRoom(payload.roomId, authed.id);
    if (!check.ok) return socket.disconnect();

    socket.data.roomId = payload.roomId;
    await socket.join(payload.roomId);
    io.to(payload.roomId).emit("user-joined", {
      userId: authed.id,
      role: authed.role,
      name: authed.name,
    });
  });

  socket.on("leave-room", async (payload: LeaveRoomPayload) => {
    await socket.leave(payload.roomId);
  });

  socket.on("code-change", (payload: CodeChangePayload) => {
    socket.to(payload.roomId).emit("code-update", {
      code: payload.code,
      language: payload.language,
    });
  });

  socket.on("cursor-move", (payload: CursorMovePayload) => {
    socket.to(payload.roomId).emit("cursor-update", {
      userId: payload.userId,
      line: payload.line,
      col: payload.col,
    });
  });

  socket.on("start-interview", async (payload: StartEndPayload) => {
    const authed = socket.data.user;
    if (!authed) return;
    const check = await verifyBelongsToRoom(payload.roomId, authed.id);
    if (!check.ok) return;
    await Interview.updateOne({ roomId: payload.roomId }, { status: "ongoing" });
    io.to(payload.roomId).emit("interview-started", { roomId: payload.roomId });
  });

  socket.on("end-interview", async (payload: StartEndPayload) => {
    const authed = socket.data.user;
    if (!authed) return;
    const check = await verifyBelongsToRoom(payload.roomId, authed.id);
    if (!check.ok) return;
    await Interview.updateOne({ roomId: payload.roomId }, { status: "completed" });
    io.to(payload.roomId).emit("interview-ended", { roomId: payload.roomId });
  });
}

