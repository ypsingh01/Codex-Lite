import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f0f0f",
        panel: "#1a1a1a",
        card: "#242424",
        border: "#2e2e2e",
        accent: "#6366f1",
        "accent-hover": "#4f46e5",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
        text: "#f4f4f5",
        muted: "#71717a",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
