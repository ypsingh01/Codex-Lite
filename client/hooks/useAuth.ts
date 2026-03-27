"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const { user, token, isAuthenticated, loadFromStorage, login, logout } =
    useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return { user, token, isAuthenticated, login, logout };
}
