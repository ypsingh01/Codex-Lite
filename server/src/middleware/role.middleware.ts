import type { Request, Response, NextFunction } from "express";
import { envelopeError } from "../utils/response";

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return envelopeError(res, "Unauthorized", 401);
    if (!roles.includes(user.role)) return envelopeError(res, "Forbidden", 403);
    return next();
  };
}

