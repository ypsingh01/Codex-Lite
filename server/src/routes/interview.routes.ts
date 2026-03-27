import { Router } from "express";
import {
  createInterview,
  getByRoomId,
  getInterview,
  listInterviews,
  updateInterviewStatus,
} from "../controllers/interview.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

export const interviewRoutes = Router();

interviewRoutes.post("/", authMiddleware, requireRole("interviewer"), createInterview);
interviewRoutes.get("/", authMiddleware, listInterviews);
interviewRoutes.get("/room/:roomId", authMiddleware, getByRoomId);
interviewRoutes.get("/:id", authMiddleware, getInterview);
interviewRoutes.patch(
  "/:id/status",
  authMiddleware,
  requireRole("interviewer"),
  updateInterviewStatus,
);

