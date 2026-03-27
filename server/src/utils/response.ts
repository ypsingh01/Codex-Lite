import type { Response } from "express";

export type Envelope<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function envelopeOk<T>(res: Response, data: T, status = 200) {
  const body: Envelope<T> = { success: true, data };
  return res.status(status).json(body);
}

export function envelopeError(res: Response, error: string, status = 400) {
  const body: Envelope<never> = { success: false, error };
  return res.status(status).json(body);
}

