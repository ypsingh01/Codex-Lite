import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { envelopeError } from "../utils/response";

export type JwtUser = {
  id: string;
  role: "candidate" | "interviewer";
  email: string;
  name: string;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.header("Authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return envelopeError(res, "Unauthorized", 401);
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) return envelopeError(res, "Unauthorized", 401);

  try {
    const secret = process.env.JWT_SECRET || "";
    if (!secret) return envelopeError(res, "Unauthorized", 401);
    const decoded = jwt.verify(token, secret) as JwtUser;
    req.user = decoded;
    return next();
  } catch {
    return envelopeError(res, "Unauthorized", 401);
  }
}

