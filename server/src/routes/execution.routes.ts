import { Router } from "express";
import { executeCode } from "../controllers/execution.controller";

export const executionRoutes = Router();

executionRoutes.post("/", executeCode);

