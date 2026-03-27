import type { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { Question } from "../models/Question";
import { envelopeError, envelopeOk } from "../utils/response";

const exampleSchema = z.object({
  input: z.string(),
  output: z.string(),
  explanation: z.string(),
});

const createQuestionSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard"]),
  examples: z.array(exampleSchema).default([]),
  constraints: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

const updateQuestionSchema = createQuestionSchema.partial().refine(
  (val) => Object.keys(val).length > 0,
  { message: "No fields to update" },
);

export async function listQuestions(req: Request, res: Response) {
  const difficulty = typeof req.query.difficulty === "string" ? req.query.difficulty : undefined;
  const tagsParam = typeof req.query.tags === "string" ? req.query.tags : undefined;

  const filter: Record<string, unknown> = {};
  if (difficulty && ["easy", "medium", "hard"].includes(difficulty)) {
    filter.difficulty = difficulty;
  }
  if (tagsParam) {
    const tags = tagsParam
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (tags.length > 0) filter.tags = { $in: tags };
  }

  const questions = await Question.find(filter).sort({ createdAt: -1 }).lean();
  return envelopeOk(
    res,
    questions.map((q) => ({
      id: q._id.toString(),
      title: q.title,
      description: q.description,
      difficulty: q.difficulty,
      examples: q.examples,
      constraints: q.constraints,
      tags: q.tags,
      createdBy: q.createdBy ? q.createdBy.toString() : null,
      createdAt: q.createdAt,
    })),
  );
}

export async function getQuestion(req: Request, res: Response) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return envelopeError(res, "Invalid id", 400);

  const q = await Question.findById(id).lean();
  if (!q) return envelopeError(res, "Question not found", 404);

  return envelopeOk(res, {
    id: q._id.toString(),
    title: q.title,
    description: q.description,
    difficulty: q.difficulty,
    examples: q.examples,
    constraints: q.constraints,
    tags: q.tags,
    createdBy: q.createdBy ? q.createdBy.toString() : null,
    createdAt: q.createdAt,
  });
}

export async function createQuestion(req: Request, res: Response) {
  const user = req.user;
  if (!user) return envelopeError(res, "Unauthorized", 401);

  const parsed = createQuestionSchema.safeParse(req.body);
  if (!parsed.success) return envelopeError(res, parsed.error.message, 400);

  const q = await Question.create({
    ...parsed.data,
    createdBy: user.id,
  });

  return envelopeOk(
    res,
    {
      id: q._id.toString(),
      title: q.title,
      description: q.description,
      difficulty: q.difficulty,
      examples: q.examples,
      constraints: q.constraints,
      tags: q.tags,
      createdBy: q.createdBy ? q.createdBy.toString() : null,
      createdAt: q.createdAt,
    },
    201,
  );
}

export async function updateQuestion(req: Request, res: Response) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return envelopeError(res, "Invalid id", 400);

  const parsed = updateQuestionSchema.safeParse(req.body);
  if (!parsed.success) return envelopeError(res, parsed.error.message, 400);

  const q = await Question.findByIdAndUpdate(id, parsed.data, { new: true }).lean();
  if (!q) return envelopeError(res, "Question not found", 404);

  return envelopeOk(res, {
    id: q._id.toString(),
    title: q.title,
    description: q.description,
    difficulty: q.difficulty,
    examples: q.examples,
    constraints: q.constraints,
    tags: q.tags,
    createdBy: q.createdBy ? q.createdBy.toString() : null,
    createdAt: q.createdAt,
  });
}

export async function deleteQuestion(req: Request, res: Response) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return envelopeError(res, "Invalid id", 400);

  const deleted = await Question.findByIdAndDelete(id).lean();
  if (!deleted) return envelopeError(res, "Question not found", 404);
  return envelopeOk(res, { deleted: true });
}

