"use client";

import { cn } from "@/lib/utils";

type Difficulty = "easy" | "medium" | "hard";

const styles: Record<Difficulty, string> = {
  easy: "bg-success/20 text-success border-success/40",
  medium: "bg-warning/20 text-warning border-warning/40",
  hard: "bg-danger/20 text-danger border-danger/40",
};

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  className?: string;
}

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const label = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
        styles[difficulty],
        className
      )}
    >
      {label}
    </span>
  );
}
