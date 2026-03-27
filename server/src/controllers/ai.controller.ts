import type { Request, Response } from "express";
import { z } from "zod";
import { envelopeError, envelopeOk } from "../utils/response";
import {
  analyzeCodeWithGemini,
  generateMockQuestionWithGemini,
} from "../services/gemini.service";
import { MockSession } from "../models/MockSession";

const analyzeSchema = z.object({
  problem: z.string().min(1),
  code: z.string().min(1),
  language: z.string().min(1),
});

const generateMockSchema = z.object({
  difficulty: z.enum(["easy", "medium", "hard"]),
});

const submitMockSchema = z.object({
  question: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    difficulty: z.string().min(1),
  }),
  code: z.string().min(1),
  language: z.string().min(1),
});

export async function analyze(req: Request, res: Response) {
  const parsed = analyzeSchema.safeParse(req.body);
  if (!parsed.success) return envelopeError(res, parsed.error.message, 400);

  try {
    const feedback = await analyzeCodeWithGemini(parsed.data);
    return envelopeOk(res, feedback);
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI analysis failed";
    return envelopeError(res, message, 500);
  }
}

export async function mockGenerate(req: Request, res: Response) {
  const parsed = generateMockSchema.safeParse(req.body);
  if (!parsed.success) return envelopeError(res, parsed.error.message, 400);

  try {
    const question = await generateMockQuestionWithGemini(parsed.data);
    return envelopeOk(res, question);
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI generation failed";
    return envelopeError(res, message, 500);
  }
}

export async function mockSubmit(req: Request, res: Response) {
  const user = req.user;
  if (!user) return envelopeError(res, "Unauthorized", 401);

  const parsed = submitMockSchema.safeParse(req.body);
  if (!parsed.success) return envelopeError(res, parsed.error.message, 400);

  try {
    const problem = `${parsed.data.question.title}\n\n${parsed.data.question.description}`;
    const feedback = await analyzeCodeWithGemini({
      problem,
      code: parsed.data.code,
      language: parsed.data.language,
    });

    await MockSession.create({
      candidateId: user.id,
      question: parsed.data.question,
      submittedCode: parsed.data.code,
      language: parsed.data.language,
      aiFeedback: feedback,
    });

    return envelopeOk(res, feedback);
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI submit failed";
    return envelopeError(res, message, 500);
  }
}

