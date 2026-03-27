"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { ApiEnvelope } from "@/types";
import type { Interview, Review } from "@/types";
import { InterviewCard } from "@/components/dashboard/InterviewCard";
import { ReviewCard } from "@/components/dashboard/ReviewCard";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function CandidateDashboardPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [reviews, setReviews] = useState<Array<{ review: Review; interview?: Interview }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: listData } = await api.get<ApiEnvelope<Interview[]>>("/interviews");
        if (listData.success && listData.data) {
          setInterviews(listData.data);
          const completed = listData.data.filter((i) => i.status === "completed" && i.reviewId);
          const reviewData: Array<{ review: Review; interview?: Interview }> = [];
          for (const inv of completed) {
            const rid = typeof inv.reviewId === "object" && inv.reviewId !== null && "interviewId" in inv.reviewId
              ? (inv.reviewId as Review).interviewId
              : inv._id;
            try {
              const { data: r } = await api.get<ApiEnvelope<Review>>(
                `/reviews/interview/${rid}`
              );
              if (r.success && r.data) reviewData.push({ review: r.data, interview: inv });
            } catch {
              // skip
            }
          }
          setReviews(reviewData);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const upcoming = interviews.filter(
    (i) => i.status === "scheduled" || i.status === "ongoing"
  );
  const total = interviews.length;
  const completedCount = interviews.filter((i) => i.status === "completed").length;
  const pendingCount = upcoming.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-text mb-6">Candidate Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted">Total interviews</p>
          <p className="text-2xl font-bold text-text">{total}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted">Completed</p>
          <p className="text-2xl font-bold text-success">{completedCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted">Pending</p>
          <p className="text-2xl font-bold text-warning">{pendingCount}</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-text mb-4">Upcoming Interviews</h2>
        {upcoming.length === 0 ? (
          <p className="text-muted">No upcoming interviews.</p>
        ) : (
          <div className="space-y-4">
            {upcoming.map((inv) => (
              <InterviewCard key={inv._id} interview={inv} currentRole="candidate" />
            ))}
          </div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-text mb-4">Past Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-muted">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(({ review, interview }) => (
              <ReviewCard
                key={review.interviewId}
                review={review}
                questionTitle={
                  interview?.questionId && typeof interview.questionId === "object" && interview.questionId !== null && "title" in interview.questionId
                    ? (interview.questionId as { title: string }).title
                    : undefined
                }
                interviewDate={
                  interview?.scheduledAt
                    ? new Date(interview.scheduledAt).toLocaleDateString()
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </section>

      <Link
        href="/candidate/mock"
        className="inline-flex items-center justify-center rounded-lg bg-accent px-6 py-3 font-medium text-white hover:bg-accent-hover"
      >
        Start AI Mock Interview
      </Link>
    </div>
  );
}
