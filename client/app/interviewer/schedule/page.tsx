"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ApiEnvelope } from "@/types";
import type { Question } from "@/types";
import { ScheduleModal } from "@/components/modals/ScheduleModal";

export default function ScheduleInterviewPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await api.get<ApiEnvelope<Question[]>>("/questions");
      if (data.success && data.data) setQuestions(data.data);
    })();
  }, []);

  const handleSuccess = (roomId: string) => {
    setSuccessMessage(`Interview scheduled. Room ID: ${roomId}. Share this with the candidate.`);
    setModalOpen(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-text mb-6">Schedule Interview</h1>
      {successMessage && (
        <div className="rounded-lg border border-success/40 bg-success/10 text-success p-4 mb-6">
          {successMessage}
        </div>
      )}
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="rounded-lg bg-accent px-4 py-2 text-white font-medium hover:bg-accent-hover"
      >
        Schedule new interview
      </button>
      <ScheduleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        questions={questions}
      />
    </div>
  );
}
