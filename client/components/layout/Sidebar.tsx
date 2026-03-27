"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface SidebarLink {
  href: string;
  label: string;
}

interface SidebarProps {
  links: SidebarLink[];
  onLogout?: () => void;
}

export function Sidebar({ links, onLogout }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-56 border-r border-border bg-panel min-h-screen flex flex-col">
      <div className="p-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "block px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === link.href
                ? "bg-accent text-white"
                : "text-muted hover:text-text hover:bg-card"
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
      {onLogout && (
        <div className="mt-auto p-4 border-t border-border">
          <button
            type="button"
            onClick={onLogout}
            className="w-full text-left px-3 py-2 rounded-md text-sm text-muted hover:text-danger hover:bg-card transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </aside>
  );
}
