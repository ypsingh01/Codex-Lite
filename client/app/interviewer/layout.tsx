"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function InterviewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loadFromStorage, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    loadFromStorage();
    const { isAuthenticated: authed } = useAuthStore.getState();
    const role = localStorage.getItem("codex_role");
    if (!authed || role !== "interviewer") {
      router.replace("/login?role=interviewer");
    }
  }, [loadFromStorage, router]);

  const links = [
    { href: "/interviewer/dashboard", label: "Dashboard" },
    { href: "/interviewer/schedule", label: "Schedule Interview" },
    { href: "/interviewer/questions", label: "Question Bank" },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar links={links} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
