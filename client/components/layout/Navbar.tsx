"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavbarProps {
  title?: string;
  right?: React.ReactNode;
  className?: string;
}

export function Navbar({ title = "CODEX", right, className }: NavbarProps) {
  return (
    <nav
      className={cn(
        "flex items-center justify-between h-14 px-4 border-b border-border bg-panel",
        className
      )}
    >
      <Link href="/" className="font-semibold text-text hover:text-accent">
        {title}
      </Link>
      {right}
    </nav>
  );
}
