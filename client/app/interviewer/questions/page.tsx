"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ApiEnvelope } from "@/types";
import type { Question } from "@/types";
import { DifficultyBadge } from "@/components/shared/DifficultyBadge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { cn } from "@/lib/utils";

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Question>>({});
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchQuestions = async () => {
    const { data } = await api.get<ApiEnvelope<Question[]>>("/questions");
    if (data.success && data.data) setQuestions(data.data);
  };

  useEffect(() => {
    (async () => {
      await fetchQuestions();
      setLoading(false);
    })();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.difficulty) return;
    setSaving(true);
    try {
      await api.post("/questions", {
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        examples: formData.examples ?? [],
        constraints: formData.constraints ?? [],
        tags: formData.tags ?? [],
      });
      await fetchQuestions();
      setCreating(false);
      setFormData({});
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.title && !formData.description && !formData.difficulty) return;
    setSaving(true);
    try {
      await api.put(`/questions/${id}`, {
        ...(formData.title && { title: formData.title }),
        ...(formData.description && { description: formData.description }),
        ...(formData.difficulty && { difficulty: formData.difficulty }),
        ...(formData.examples && { examples: formData.examples }),
        ...(formData.constraints && { constraints: formData.constraints }),
        ...(formData.tags && { tags: formData.tags }),
      });
      await fetchQuestions();
      setEditingId(null);
      setFormData({});
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    await api.delete(`/questions/${id}`);
    await fetchQuestions();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-text mb-6">Question Bank</h1>

      {!creating ? (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-lg bg-accent px-4 py-2 text-white font-medium hover:bg-accent-hover mb-6"
        >
          Add Question
        </button>
      ) : (
        <form
          onSubmit={handleCreate}
          className="rounded-lg border border-border bg-card p-4 mb-6 space-y-4"
        >
          <h2 className="font-semibold text-text">New question</h2>
          <input
            type="text"
            placeholder="Title"
            value={formData.title ?? ""}
            onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-text"
            required
          />
          <textarea
            placeholder="Description (markdown)"
            value={formData.description ?? ""}
            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            rows={4}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-text"
            required
          />
          <select
            value={formData.difficulty ?? "medium"}
            onChange={(e) =>
              setFormData((p) => ({
                ...p,
                difficulty: e.target.value as "easy" | "medium" | "hard",
              }))
            }
            className="rounded-md border border-border bg-background px-3 py-2 text-text"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-accent px-4 py-2 text-white text-sm disabled:opacity-50"
            >
              {saving ? "Saving..." : "Create"}
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="rounded-md border border-border px-4 py-2 text-muted text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {questions.map((q) => (
          <div
            key={q.id}
            className="rounded-lg border border-border bg-card p-4"
          >
            {editingId === q.id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={formData.title ?? q.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-text"
                />
                <textarea
                  value={formData.description ?? q.description}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={3}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-text"
                />
                <select
                  value={formData.difficulty ?? q.difficulty}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      difficulty: e.target.value as "easy" | "medium" | "hard",
                    }))
                  }
                  className="rounded-md border border-border bg-background px-3 py-2 text-text"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdate(q.id)}
                    disabled={saving}
                    className="rounded-md bg-accent px-3 py-1.5 text-white text-sm"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditingId(null); setFormData({}); }}
                    className="rounded-md border border-border px-3 py-1.5 text-muted text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-text">{q.title}</h3>
                    <DifficultyBadge difficulty={q.difficulty} className="mt-1" />
                    {q.tags && q.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {q.tags.map((t) => (
                          <span
                            key={t}
                            className="text-xs px-2 py-0.5 rounded bg-panel border border-border text-muted"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(q.id);
                        setFormData({
                          title: q.title,
                          description: q.description,
                          difficulty: q.difficulty,
                        });
                      }}
                      className="text-sm text-accent hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(q.id)}
                      className="text-sm text-danger hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
