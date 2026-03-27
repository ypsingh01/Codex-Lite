"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { DifficultyBadge } from "@/components/shared/DifficultyBadge";
import { cn } from "@/lib/utils";
import type { Interview, InterviewStatus, Question, User } from "@/types";

function getOtherName(interview: Interview, currentRole: "candidate" | "interviewer"): string {
  const other = currentRole === "candidate" ? interview.interviewerId : interview.candidateId;
  return typeof other === "object" && other !== null && "name" in other
    ? (other as User).name
    : "—";
}

function getQuestionTitle(interview: Interview): string {
  const q = interview.questionId;
  return typeof q === "object" && q !== null && "title" in q ? (q as Question).title : "—";
}

const statusStyles: Record<InterviewStatus, string> = {
  scheduled: "bg-accent/20 text-accent border-accent/40",
  ongoing: "bg-warning/20 text-warning border-warning/40",
  completed: "bg-success/20 text-success border-success/40",
  cancelled: "bg-danger/20 text-danger border-danger/40",
};

interface InterviewCardProps {
  interview: Interview;
  currentRole: "candidate" | "interviewer";
}

export function InterviewCard({ interview, currentRole }: InterviewCardProps) {
  const date = new Date(interview.scheduledAt);
  const status = interview.status as InterviewStatus;
  const canJoin = currentRole === "candidate" && (status === "scheduled" || status === "ongoing");

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium text-text">{getOtherName(interview, currentRole)}</p>
          <p className="text-sm text-muted">{getQuestionTitle(interview)}</p>
          <p className="text-xs text-muted mt-1">
            {date.toLocaleString()} · {interview.durationMins} min
          </p>
        </div>
        <span
          className={cn(
            "inline-flex px-2 py-0.5 rounded text-xs font-medium border",
            statusStyles[status]
          )}
        >
          {status}
        </span>
      </div>
      {interview.meetLink && (
        <a
          href={interview.meetLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-accent hover:text-accent-hover mt-2"
        >
          <ExternalLink className="w-4 h-4" />
          Meet link
        </a>
      )}
      <div className="mt-3">
        {canJoin ? (
          <Link
            href={`/interview/${interview.roomId}`}
            className="inline-flex items-center justify-center rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover"
          >
            Join Interview
          </Link>
        ) : (
          <Link
            href={`/interview/${interview.roomId}`}
            className="inline-flex items-center justify-center rounded-md border border-border bg-card px-3 py-1.5 text-sm text-text hover:bg-panel"
          >
            View Details
          </Link>
        )}
      </div>
    </div>
  );
}
