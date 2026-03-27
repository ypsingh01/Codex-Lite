import { Router } from "express";
import {
  createQuestion,
  deleteQuestion,
  getQuestion,
  listQuestions,
  updateQuestion,
} from "../controllers/question.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

export const questionRoutes = Router();

questionRoutes.get("/", listQuestions);
questionRoutes.get("/:id", getQuestion);
questionRoutes.post("/", authMiddleware, requireRole("interviewer"), createQuestion);
questionRoutes.put("/:id", authMiddleware, requireRole("interviewer"), updateQuestion);
questionRoutes.delete("/:id", authMiddleware, requireRole("interviewer"), deleteQuestion);

