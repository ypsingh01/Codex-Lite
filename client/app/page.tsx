"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-panel to-background flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl"
      >
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent mb-4">
          CODEX
        </h1>
        <p className="text-xl text-muted mb-8">
          AI Powered Coding Interview Platform
        </p>
        <div className="flex flex-wrap gap-4 justify-center mb-16">
          <Link
            href="/login?role=candidate"
            className="inline-flex items-center justify-center rounded-lg bg-accent px-6 py-3 text-lg font-medium text-white hover:bg-accent-hover transition-colors"
          >
            Login as Candidate
          </Link>
          <Link
            href="/login?role=interviewer"
            className="inline-flex items-center justify-center rounded-lg border-2 border-border bg-card px-6 py-3 text-lg font-medium text-text hover:bg-panel transition-colors"
          >
            Login as Interviewer
          </Link>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
        >
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold text-text mb-2">Real-time Collaboration</h3>
            <p className="text-sm text-muted">
              Shared code editor and chat so interviewers and candidates work together live.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold text-text mb-2">AI Feedback</h3>
            <p className="text-sm text-muted">
              Get instant analysis on approach, complexity, and code quality with Gemini.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold text-text mb-2">Code Execution</h3>
            <p className="text-sm text-muted">
              Run code in multiple languages via Judge0 and see output in the console.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
