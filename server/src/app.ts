import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import { authRoutes } from "./routes/auth.routes";
import { interviewRoutes } from "./routes/interview.routes";
import { questionRoutes } from "./routes/question.routes";
import { reviewRoutes } from "./routes/review.routes";
import { executionRoutes } from "./routes/execution.routes";
import { aiRoutes } from "./routes/ai.routes";
import { envelopeError } from "./utils/response";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ success: true, data: { status: "ok" } });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/interviews", interviewRoutes);
  app.use("/api/questions", questionRoutes);
  app.use("/api/reviews", reviewRoutes);
  app.use("/api/execute", executionRoutes);
  app.use("/api/ai", aiRoutes);

  // 404
  app.use((_req, res) => {
    res.status(404).json({ success: false, error: "Not found" });
  });

  // error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const message =
      err instanceof Error ? err.message : "Unexpected server error";
    envelopeError(res, message, 500);
  });

  return app;
}

