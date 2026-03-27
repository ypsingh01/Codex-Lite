"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { ApiEnvelope } from "@/types";
import type { Interview } from "@/types";
import { InterviewCard } from "@/components/dashboard/InterviewCard";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function InterviewerDashboardPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<ApiEnvelope<Interview[]>>("/interviews");
        if (data.success && data.data) setInterviews(data.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const total = interviews.length;
  const completedCount = interviews.filter((i) => i.status === "completed").length;
  const recent = interviews.slice(0, 10);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-text mb-6">Interviewer Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted">Total scheduled</p>
          <p className="text-2xl font-bold text-text">{total}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted">Completed</p>
          <p className="text-2xl font-bold text-success">{completedCount}</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-text mb-4">Recent Interviews</h2>
        {recent.length === 0 ? (
          <p className="text-muted">No interviews yet.</p>
        ) : (
          <div className="space-y-4">
            {recent.map((inv) => (
              <InterviewCard key={inv._id} interview={inv} currentRole="interviewer" />
            ))}
          </div>
        )}
      </section>

      <div className="flex gap-2">
        <Link
          href="/interviewer/schedule"
          className="rounded-lg bg-accent px-4 py-2 text-white font-medium hover:bg-accent-hover"
        >
          Schedule Interview
        </Link>
        <Link
          href="/interviewer/questions"
          className="rounded-lg border border-border px-4 py-2 text-text font-medium hover:bg-card"
        >
          Question Bank
        </Link>
      </div>
    </div>
  );
}
