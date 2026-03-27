"use client";

import type { Review } from "@/types";
import type { Question } from "@/types";

interface ReviewCardProps {
  review: Review;
  questionTitle?: string;
  interviewDate?: string;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(10, Math.max(0, value)) * 10;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted w-32 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-panel rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-text w-6">{value}/10</span>
    </div>
  );
}

export function ReviewCard({ review, questionTitle, interviewDate }: ReviewCardProps) {
  const avg =
    (review.problemSolvingScore +
      review.codeQualityScore +
      review.optimizationScore +
      review.communicationScore) /
    4;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      {interviewDate && (
        <p className="text-xs text-muted mb-1">{interviewDate}</p>
      )}
      {questionTitle && (
        <p className="font-medium text-text mb-3">{questionTitle}</p>
      )}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl font-bold text-accent">{avg.toFixed(1)}</span>
        <span className="text-sm text-muted">/ 10 overall</span>
      </div>
      <div className="space-y-2 mb-4">
        <ScoreBar label="Problem Solving" value={review.problemSolvingScore} />
        <ScoreBar label="Code Quality" value={review.codeQualityScore} />
        <ScoreBar label="Optimization" value={review.optimizationScore} />
        <ScoreBar label="Communication" value={review.communicationScore} />
      </div>
      <p className="text-sm text-muted border-t border-border pt-3">
        {review.writtenFeedback}
      </p>
    </div>
  );
}
