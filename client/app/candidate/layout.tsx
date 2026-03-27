"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user, loadFromStorage, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    loadFromStorage();
    const { isAuthenticated: authed } = useAuthStore.getState();
    const role = localStorage.getItem("codex_role");
    if (!authed || role !== "candidate") {
      router.replace("/login?role=candidate");
    }
  }, [loadFromStorage, router]);

  const links = [
    { href: "/candidate/dashboard", label: "Dashboard" },
    { href: "/candidate/mock", label: "Mock Interview" },
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
