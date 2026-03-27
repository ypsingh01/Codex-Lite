import { Router } from "express";
import { createReview, getReviewByInterview } from "../controllers/review.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

export const reviewRoutes = Router();

reviewRoutes.post("/", authMiddleware, requireRole("interviewer"), createReview);
reviewRoutes.get("/interview/:interviewId", authMiddleware, getReviewByInterview);

