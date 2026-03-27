"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import type { ApiEnvelope } from "@/types";
import type { User } from "@/types";
import type { UserRole } from "@/types";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("candidate");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const loginStore = useAuthStore.getState().login;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post<ApiEnvelope<{ token: string; user: User }>>(
        "/auth/register",
        { name, email, password, role }
      );
      if (data.success && data.data?.token && data.data?.user) {
        loginStore(data.data.user, data.data.token);
        window.location.href =
          data.data.user.role === "candidate"
            ? "/candidate/dashboard"
            : "/interviewer/dashboard";
      } else {
        setError(data.error ?? "Registration failed");
      }
    } catch (err: unknown) {
      const res = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: ApiEnvelope<unknown> } }).response?.data
        : null;
      setError(res?.error ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl">
        <h1 className="text-2xl font-bold text-text mb-2">Register</h1>
        <p className="text-muted text-sm mb-6">Create your CODEX account</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Your name"
              required
            />
          </div>
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
              minLength={6}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="candidate">Candidate</option>
              <option value="interviewer">Interviewer</option>
            </select>
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-accent py-2 text-white font-medium hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>
        <p className="mt-4 text-sm text-muted text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
