import { create } from "zustand";
import type { User } from "@/types";

const TOKEN_KEY = "codex_token";
const ROLE_KEY = "codex_role";
const USER_KEY = "codex_user";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  loadFromStorage: () => void;
  getToken: () => string | null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (user: User, token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(ROLE_KEY, user.role);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      document.cookie = `codex_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;
      document.cookie = `codex_role=${user.role}; path=/; max-age=${7 * 24 * 60 * 60}`;
    }
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ROLE_KEY);
      localStorage.removeItem(USER_KEY);
      document.cookie = "codex_token=; path=/; max-age=0";
      document.cookie = "codex_role=; path=/; max-age=0";
    }
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadFromStorage: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
    const role = localStorage.getItem(ROLE_KEY);
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        set({ user, token, isAuthenticated: true });
        if (role) document.cookie = `codex_role=${role}; path=/; max-age=${7 * 24 * 60 * 60}`;
        document.cookie = `codex_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;
      } catch {
        get().logout();
      }
    }
  },

  getToken: () => {
    if (typeof window === "undefined") return get().token;
    return localStorage.getItem(TOKEN_KEY) ?? get().token;
  },
}));
