"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  interviewId: string;
  onSuccess: () => void;
}

export function FeedbackModal({
  open,
  onClose,
  interviewId,
  onSuccess,
}: FeedbackModalProps) {
  const [problemSolvingScore, setProblemSolvingScore] = useState(5);
  const [codeQualityScore, setCodeQualityScore] = useState(5);
  const [optimizationScore, setOptimizationScore] = useState(5);
  const [communicationScore, setCommunicationScore] = useState(5);
  const [writtenFeedback, setWrittenFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (writtenFeedback.trim().length < 20) {
      setError("Written feedback must be at least 20 characters.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/reviews", {
        interviewId,
        problemSolvingScore,
        codeQualityScore,
        optimizationScore,
        communicationScore,
        writtenFeedback: writtenFeedback.trim(),
      });
      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError("Failed to submit review.");
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

  const slider = (
    label: string,
    value: number,
    setValue: (n: number) => void
  ) => (
    <div>
      <label className="block text-sm font-medium text-muted mb-1">
        {label} ({value})
      </label>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full accent-accent"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg rounded-lg border border-border bg-panel p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-text mb-4">Submit Interview Review</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {slider("Problem Solving", problemSolvingScore, setProblemSolvingScore)}
          {slider("Code Quality", codeQualityScore, setCodeQualityScore)}
          {slider("Optimization", optimizationScore, setOptimizationScore)}
          {slider("Communication", communicationScore, setCommunicationScore)}
          <div>
            <label className="block text-sm font-medium text-muted mb-1">
              Written feedback (min 20 characters) *
            </label>
            <textarea
              value={writtenFeedback}
              onChange={(e) => setWrittenFeedback(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Describe how the candidate performed..."
              required
              minLength={20}
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
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
              disabled={loading || writtenFeedback.trim().length < 20}
              className="px-4 py-2 rounded-md bg-accent text-white hover:bg-accent-hover disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <LoadingSpinner size="sm" />}
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
