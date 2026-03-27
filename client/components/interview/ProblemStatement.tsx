"use client";

import ReactMarkdown from "react-markdown";
import { DifficultyBadge } from "@/components/shared/DifficultyBadge";
import type { Question } from "@/types";

interface ProblemStatementProps {
  question: Question;
}

export function ProblemStatement({ question }: ProblemStatementProps) {
  return (
    <div className="h-full overflow-y-auto p-4 border-r border-border bg-panel">
      <h2 className="text-lg font-semibold text-text mb-2">{question.title}</h2>
      <DifficultyBadge difficulty={question.difficulty} className="mb-3" />
      <div className="prose prose-invert prose-sm max-w-none text-muted mb-4">
        <ReactMarkdown>{question.description}</ReactMarkdown>
      </div>
      {question.examples && question.examples.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-text mb-2">Examples</h3>
          <div className="space-y-3">
            {question.examples.map((ex, i) => (
              <div
                key={i}
                className="rounded-md border border-border bg-background p-3 font-mono text-sm"
              >
                <p className="text-muted text-xs mb-1">Input: {ex.input}</p>
                <p className="text-muted text-xs mb-1">Output: {ex.output}</p>
                {ex.explanation && (
                  <p className="text-muted text-xs">{ex.explanation}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {question.constraints && question.constraints.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-text mb-2">Constraints</h3>
          <ul className="list-disc list-inside text-sm text-muted space-y-1">
            {question.constraints.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}
      {question.tags && question.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {question.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex px-2 py-0.5 rounded text-xs bg-card border border-border text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
