import { Router } from "express";
import { analyze, mockGenerate, mockSubmit } from "../controllers/ai.controller";
import { authMiddleware } from "../middleware/auth.middleware";

export const aiRoutes = Router();

aiRoutes.post("/analyze", analyze);
aiRoutes.post("/mock/generate", mockGenerate);
aiRoutes.post("/mock/submit", authMiddleware, mockSubmit);

