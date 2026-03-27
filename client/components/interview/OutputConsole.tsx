"use client";

import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { cn } from "@/lib/utils";

interface OutputConsoleProps {
  output?: string;
  error?: string;
  status?: string;
  time?: string | null;
  memory?: number | null;
  isLoading?: boolean;
}

export function OutputConsole({
  output = "",
  error = "",
  status,
  time,
  memory,
  isLoading = false,
}: OutputConsoleProps) {
  const isAccepted = status?.toLowerCase().includes("accepted");
  const isError =
    status &&
    (status.toLowerCase().includes("error") ||
      status.toLowerCase().includes("exceeded"));

  return (
    <div className="h-40 border-t border-border bg-panel flex flex-col">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        {status && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded",
              isAccepted && "bg-success/20 text-success",
              isError && "bg-danger/20 text-danger",
              !isAccepted && !isError && "bg-warning/20 text-warning"
            )}
          >
            {status}
          </span>
        )}
        {time != null && (
          <span className="text-xs text-muted">Time: {time}s</span>
        )}
        {memory != null && (
          <span className="text-xs text-muted">Memory: {memory} KB</span>
        )}
      </div>
      <div className="flex-1 overflow-auto p-3 font-mono text-sm">
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted">
            <LoadingSpinner size="sm" />
            Running...
          </div>
        ) : !output && !error ? (
          <p className="text-muted">Run your code to see output.</p>
        ) : (
          <>
            {output && (
              <pre className="text-success whitespace-pre-wrap break-all mb-2">
                {output}
              </pre>
            )}
            {error && (
              <pre className="text-danger whitespace-pre-wrap break-all">
                {error}
              </pre>
            )}
          </>
        )}
      </div>
    </div>
  );
}
