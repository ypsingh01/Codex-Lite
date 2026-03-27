"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import type { ApiEnvelope } from "@/types";
import type { User } from "@/types";

function LoginForm() {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role") as "candidate" | "interviewer" | null;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const loginStore = useAuthStore.getState().login;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post<ApiEnvelope<{ token: string; user: User }>>(
        "/auth/login",
        { email, password }
      );
      if (data.success && data.data?.token && data.data?.user) {
        loginStore(data.data.user, data.data.token);
        const role = data.data.user.role;
        if (role === "candidate") window.location.href = "/candidate/dashboard";
        else if (role === "interviewer") window.location.href = "/interviewer/dashboard";
        else window.location.href = "/";
      } else {
        setError(data.error ?? "Login failed");
      }
    } catch (err: unknown) {
      const res = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: ApiEnvelope<unknown> } }).response?.data
        : null;
      setError(res?.error ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl">
        <h1 className="text-2xl font-bold text-text mb-2">Login</h1>
        <p className="text-muted text-sm mb-6">
          {roleParam
            ? `Sign in as ${roleParam}`
            : "Sign in to your CODEX account"}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-accent py-2 text-white font-medium hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-sm text-muted text-center">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-accent hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-muted">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
