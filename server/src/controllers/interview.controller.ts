import type { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { Interview } from "../models/Interview";
import { User } from "../models/User";
import { envelopeError, envelopeOk } from "../utils/response";

const createInterviewSchema = z.object({
  candidateEmail: z.string().email(),
  questionId: z.string().min(1),
  scheduledAt: z.string().min(1),
  durationMins: z.number().int().min(15).max(240).optional(),
  meetLink: z.string().optional(),
});

const statusSchema = z.object({
  status: z.enum(["scheduled", "ongoing", "completed", "cancelled"]),
});

function populateInterviewQuery() {
  return Interview.find()
    .populate("questionId")
    .populate("interviewerId", "-password")
    .populate("candidateId", "-password")
    .populate("reviewId");
}

export async function createInterview(req: Request, res: Response) {
  const user = req.user;
  if (!user) return envelopeError(res, "Unauthorized", 401);

  const parsed = createInterviewSchema.safeParse(req.body);
  if (!parsed.success) return envelopeError(res, parsed.error.message, 400);

  const { candidateEmail, questionId, scheduledAt, durationMins, meetLink } =
    parsed.data;

  const candidate = await User.findOne({
    email: candidateEmail.toLowerCase(),
    role: "candidate",
  }).lean();
  if (!candidate) return envelopeError(res, "Candidate not found", 404);
  if (!mongoose.isValidObjectId(questionId)) {
    return envelopeError(res, "Invalid questionId", 400);
  }

  const roomId = nanoid(10);
  const interview = await Interview.create({
    interviewerId: user.id,
    candidateId: candidate._id,
    questionId,
    scheduledAt: new Date(scheduledAt),
    durationMins: durationMins ?? 60,
    meetLink: meetLink ?? "",
    roomId,
  });

  const populated = await Interview.findById(interview._id)
    .populate("questionId")
    .populate("interviewerId", "-password")
    .populate("candidateId", "-password")
    .populate("reviewId")
    .lean();

  return envelopeOk(res, populated, 201);
}

export async function listInterviews(req: Request, res: Response) {
  const user = req.user;
  if (!user) return envelopeError(res, "Unauthorized", 401);

  const filter =
    user.role === "interviewer"
      ? { interviewerId: user.id }
      : { candidateId: user.id };

  const interviews = await Interview.find(filter)
    .populate("questionId")
    .populate("interviewerId", "-password")
    .populate("candidateId", "-password")
    .populate("reviewId")
    .sort({ scheduledAt: -1 })
    .lean();

  return envelopeOk(res, interviews);
}

export async function getInterview(req: Request, res: Response) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return envelopeError(res, "Invalid id", 400);

  const interview = await Interview.findById(id)
    .populate("questionId")
    .populate("interviewerId", "-password")
    .populate("candidateId", "-password")
    .populate("reviewId")
    .lean();

  if (!interview) return envelopeError(res, "Interview not found", 404);
  return envelopeOk(res, interview);
}

export async function updateInterviewStatus(req: Request, res: Response) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return envelopeError(res, "Invalid id", 400);

  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) return envelopeError(res, parsed.error.message, 400);

  const updated = await Interview.findByIdAndUpdate(
    id,
    { status: parsed.data.status },
    { new: true },
  )
    .populate("questionId")
    .populate("interviewerId", "-password")
    .populate("candidateId", "-password")
    .populate("reviewId")
    .lean();

  if (!updated) return envelopeError(res, "Interview not found", 404);
  return envelopeOk(res, updated);
}

export async function getByRoomId(req: Request, res: Response) {
  const { roomId } = req.params;
  const interview = await Interview.findOne({ roomId })
    .populate("questionId")
    .populate("interviewerId", "-password")
    .populate("candidateId", "-password")
    .populate("reviewId")
    .lean();

  if (!interview) return envelopeError(res, "Interview not found", 404);
  return envelopeOk(res, interview);
}

export async function assertUserInInterviewByRoom(roomId: string, userId: string) {
  const interview = await Interview.findOne({ roomId }).lean();
  if (!interview) return { ok: false as const, error: "Interview not found" };
  const belongs =
    interview.candidateId.toString() === userId ||
    interview.interviewerId.toString() === userId;
  if (!belongs) return { ok: false as const, error: "Forbidden" };
  return { ok: true as const, interview };
}

