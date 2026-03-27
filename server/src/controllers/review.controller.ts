import type { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { Review } from "../models/Review";
import { Interview } from "../models/Interview";
import { envelopeError, envelopeOk } from "../utils/response";

const createReviewSchema = z.object({
  interviewId: z.string().min(1),
  problemSolvingScore: z.number().int().min(1).max(10),
  codeQualityScore: z.number().int().min(1).max(10),
  optimizationScore: z.number().int().min(1).max(10),
  communicationScore: z.number().int().min(1).max(10),
  writtenFeedback: z.string().min(20),
});

export async function createReview(req: Request, res: Response) {
  const parsed = createReviewSchema.safeParse(req.body);
  if (!parsed.success) return envelopeError(res, parsed.error.message, 400);

  const { interviewId, ...scores } = parsed.data;
  if (!mongoose.isValidObjectId(interviewId)) {
    return envelopeError(res, "Invalid interviewId", 400);
  }

  const interview = await Interview.findById(interviewId);
  if (!interview) return envelopeError(res, "Interview not found", 404);

  const existing = await Review.findOne({ interviewId }).lean();
  if (existing) return envelopeError(res, "Review already submitted", 400);

  const review = await Review.create({ interviewId, ...scores });

  interview.reviewId = review._id;
  interview.status = "completed";
  await interview.save();

  const populated = await Review.findById(review._id).lean();
  return envelopeOk(res, populated, 201);
}

export async function getReviewByInterview(req: Request, res: Response) {
  const { interviewId } = req.params;
  if (!mongoose.isValidObjectId(interviewId)) {
    return envelopeError(res, "Invalid interviewId", 400);
  }

  const review = await Review.findOne({ interviewId }).lean();
  if (!review) return envelopeError(res, "Review not found", 404);
  return envelopeOk(res, review);
}

