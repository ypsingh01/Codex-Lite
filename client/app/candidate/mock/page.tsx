"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";
import type { ApiEnvelope } from "@/types";
import type { MockQuestion, AiFeedback } from "@/types";
import { useCodeEditor, LANGUAGE_OPTIONS } from "@/hooks/useCodeEditor";
import { DifficultyBadge } from "@/components/shared/DifficultyBadge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import ReactMarkdown from "react-markdown";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="h-64 bg-panel flex items-center justify-center text-muted">Loading editor...</div>,
});

type Step = "select" | "code" | "feedback";

const DIFFICULTIES = ["easy", "medium", "hard"] as const;

export default function MockInterviewPage() {
  const [step, setStep] = useState<Step>("select");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [question, setQuestion] = useState<MockQuestion | null>(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [feedback, setFeedback] = useState<AiFeedback | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const {
    code,
    language,
    setLanguage,
    handleEditorChange,
    languageOptions,
  } = useCodeEditor("python");

  const generateQuestion = async () => {
    setLoadingQuestion(true);
    try {
      const { data } = await api.post<ApiEnvelope<MockQuestion>>("/ai/mock/generate", {
        difficulty,
      });
      if (data.success && data.data) {
        setQuestion(data.data);
        setStep("code");
      }
    } finally {
      setLoadingQuestion(false);
    }
  };

  const submitForReview = async () => {
    if (!question) return;
    setLoadingFeedback(true);
    try {
      const { data } = await api.post<ApiEnvelope<AiFeedback>>("/ai/mock/submit", {
        question: {
          title: question.title,
          description: question.description,
          difficulty,
        },
        code,
        language,
      });
      if (data.success && data.data) {
        setFeedback(data.data);
        setStep("feedback");
      }
    } finally {
      setLoadingFeedback(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-text mb-6">AI Mock Interview</h1>

      {step === "select" && (
        <div className="space-y-6">
          <p className="text-muted">Choose difficulty and generate a question.</p>
          <div className="flex gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className="px-4 py-2 rounded-md border border-border font-medium capitalize hover:bg-card data-[active]:bg-accent data-[active]:text-white data-[active]:border-accent"
                data-active={difficulty === d}
              >
                {d}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={generateQuestion}
            disabled={loadingQuestion}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-white font-medium hover:bg-accent-hover disabled:opacity-50"
          >
            {loadingQuestion && <LoadingSpinner size="sm" />}
            Generate Question
          </button>
        </div>
      )}

      {step === "code" && question && (
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-lg font-semibold text-text mb-2">{question.title}</h2>
            <DifficultyBadge difficulty={difficulty} className="mb-2" />
            <div className="prose prose-invert prose-sm max-w-none text-muted">
              <ReactMarkdown>{question.description}</ReactMarkdown>
            </div>
            {question.examples?.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-text mb-2">Examples</h3>
                {question.examples.map((ex, i) => (
                  <div key={i} className="rounded border border-border bg-background p-2 font-mono text-sm mb-2">
                    <p>Input: {ex.input}</p>
                    <p>Output: {ex.output}</p>
                    {ex.explanation && <p className="text-muted">{ex.explanation}</p>}
                  </div>
                ))}
              </div>
            )}
            {question.constraints?.length > 0 && (
              <ul className="list-disc list-inside text-sm text-muted mt-2">
                {question.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "python" | "javascript" | "java" | "c++")}
              className="rounded-md border border-border bg-background px-3 py-2 text-text mb-2"
            >
              {languageOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="rounded-lg border border-border overflow-hidden">
              <MonacoEditor
                height="320px"
                language={language === "c++" ? "cpp" : language}
                value={code}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{ fontSize: 14, minimap: { enabled: false } }}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep("select")}
              className="px-4 py-2 rounded-md border border-border text-muted hover:text-text"
            >
              Back
            </button>
            <button
              type="button"
              onClick={submitForReview}
              disabled={loadingFeedback}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-white font-medium hover:bg-accent-hover disabled:opacity-50"
            >
              {loadingFeedback && <LoadingSpinner size="sm" />}
              Submit for AI Review
            </button>
          </div>
        </div>
      )}

      {step === "feedback" && feedback && (
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text">AI Feedback</h2>
          <p><span className="text-muted">Approach:</span> {feedback.approach}</p>
          <p><span className="text-muted">Time complexity:</span> {feedback.timeComplexity}</p>
          <p><span className="text-muted">Space complexity:</span> {feedback.spaceComplexity}</p>
          <p><span className="text-muted">Code quality:</span> {feedback.codeQuality}</p>
          {feedback.optimizationSuggestions?.length > 0 && (
            <div>
              <p className="text-muted mb-1">Optimization suggestions:</p>
              <ul className="list-disc list-inside text-sm">
                {feedback.optimizationSuggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex items-center gap-2 pt-2">
            <span className="text-muted">Overall score:</span>
            <span className="text-2xl font-bold text-accent">{feedback.overallScore}/10</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setStep("select");
              setQuestion(null);
              setFeedback(null);
            }}
            className="mt-4 rounded-lg bg-accent px-4 py-2 text-white font-medium hover:bg-accent-hover"
          >
            Try another question
          </button>
        </div>
      )}
    </div>
  );
}
