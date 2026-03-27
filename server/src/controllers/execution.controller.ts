import type { Request, Response } from "express";
import { z } from "zod";
import { envelopeError, envelopeOk } from "../utils/response";
import { runOnJudge0 } from "../services/judge0.service";

const executeSchema = z.object({
  code: z.string().min(1),
  languageId: z.number().int(),
  stdin: z.string().optional(),
});

export async function executeCode(req: Request, res: Response) {
  const parsed = executeSchema.safeParse(req.body);
  if (!parsed.success) return envelopeError(res, parsed.error.message, 400);

  try {
    const result = await runOnJudge0(parsed.data);
    return envelopeOk(res, result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Execution failed";
    return envelopeError(res, message, 500);
  }
}

