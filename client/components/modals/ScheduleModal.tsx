"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import type { Question } from "@/types";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { cn } from "@/lib/utils";

interface ScheduleModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (roomId: string) => void;
  questions: Question[];
}

const DURATIONS = [30, 45, 60, 90];

export function ScheduleModal({
  open,
  onClose,
  onSuccess,
  questions,
}: ScheduleModalProps) {
  const [candidateEmail, setCandidateEmail] = useState("");
  const [questionId, setQuestionId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [durationMins, setDurationMins] = useState(60);
  const [meetLink, setMeetLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!candidateEmail.trim() || !questionId || !scheduledDate || !scheduledTime) {
      setError("Fill candidate email, question, date and time.");
      return;
    }
    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
    setLoading(true);
    try {
      const { data } = await api.post<{ success: boolean; data: { roomId: string } }>(
        "/interviews",
        {
          candidateEmail: candidateEmail.trim(),
          questionId,
          scheduledAt,
          durationMins,
          meetLink: meetLink.trim() || undefined,
        }
      );
      if (data.success && data.data?.roomId) {
        onSuccess(data.data.roomId);
        onClose();
      } else {
        setError("Failed to create interview.");
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : "Request failed";
      setError(msg ?? "Request failed");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-lg border border-border bg-panel p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-text mb-4">Schedule Interview</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1">
              Candidate email
            </label>
            <input
              type="email"
              value={candidateEmail}
              onChange={(e) => setCandidateEmail(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="candidate@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1">
              Question
            </label>
            <select
              value={questionId}
              onChange={(e) => setQuestionId(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-accent"
              required
            >
              <option value="">Select question</option>
              {questions.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title} ({q.difficulty})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Date</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Time</label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1">
              Duration (minutes)
            </label>
            <div className="flex gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDurationMins(d)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium border transition-colors",
                    durationMins === d
                      ? "bg-accent text-white border-accent"
                      : "border-border text-muted hover:text-text"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1">
              Google Meet link (optional)
            </label>
            <input
              type="url"
              value={meetLink}
              onChange={(e) => setMeetLink(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="https://meet.google.com/..."
            />
          </div>
          {error && (
            <p className="text-sm text-danger">{error}</p>
          )}
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-border text-muted hover:text-text"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-md bg-accent text-white hover:bg-accent-hover disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <LoadingSpinner size="sm" />}
              Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
