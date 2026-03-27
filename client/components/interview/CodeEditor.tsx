"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useCodeEditor, type CodeEditorLanguage } from "@/hooks/useCodeEditor";
import { LANGUAGE_OPTIONS } from "@/hooks/useCodeEditor";
import { cn } from "@/lib/utils";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 bg-panel text-muted">
      Loading editor...
    </div>
  ),
});

interface CodeEditorProps {
  roomId: string;
  initialCode?: string;
  initialLanguage?: CodeEditorLanguage;
  onCodeChange?: (code: string, language: string) => void;
  socket: ReturnType<typeof import("socket.io-client").io> | null;
  readOnly?: boolean;
}

const monacoLanguageMap: Record<string, string> = {
  python: "python",
  javascript: "javascript",
  java: "java",
  "c++": "cpp",
};

export function CodeEditor({
  roomId,
  initialCode,
  initialLanguage = "python",
  onCodeChange,
  socket,
  readOnly = false,
}: CodeEditorProps) {
  const {
    code,
    language,
    setLanguage,
    handleEditorChange,
    setCodeFromRemote,
  } = useCodeEditor(initialLanguage);
  const remoteUpdateRef = useRef(false);

  useEffect(() => {
    if (initialCode !== undefined) setCodeFromRemote(initialCode, initialLanguage);
  }, [initialCode, initialLanguage, setCodeFromRemote]);

  useEffect(() => {
    onCodeChange?.(code, language);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = (payload: { code: string; language?: string }) => {
      remoteUpdateRef.current = true;
      setCodeFromRemote(payload.code, payload.language);
    };
    socket.on("code-update", handler);
    return () => {
      socket.off("code-update", handler);
    };
  }, [socket, setCodeFromRemote]);

  const handleChange = (value: string | undefined) => {
    handleEditorChange(value);
    if (!remoteUpdateRef.current && socket) {
      socket.emit("code-change", { roomId, code: value ?? "", language });
    }
    remoteUpdateRef.current = false;
    onCodeChange?.(value ?? "", language);
  };

  return (
    <div className="h-full flex flex-col bg-panel">
      <div className="flex items-center gap-2 p-2 border-b border-border">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as CodeEditorLanguage)}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
          disabled={readOnly}
        >
          {LANGUAGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 min-h-0">
        <MonacoEditor
          height="100%"
          language={monacoLanguageMap[language] ?? "plaintext"}
          value={code}
          onChange={handleChange}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: "JetBrains Mono, monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            readOnly,
          }}
        />
      </div>
    </div>
  );
}
