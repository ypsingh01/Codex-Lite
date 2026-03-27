"use client";

import { useEffect, useRef, useState } from "react";

interface ChatMessage {
  senderName: string;
  message: string;
  timestamp: string;
}

interface ChatPanelProps {
  roomId: string;
  currentUserName: string;
  socket: ReturnType<typeof import("socket.io-client").io> | null;
}

export function ChatPanel({ roomId, currentUserName, socket }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;
    const handler = (payload: ChatMessage) => {
      setMessages((prev) => [...prev, payload]);
    };
    socket.on("chat-message", handler);
    return () => {
      socket.off("chat-message", handler);
    };
  }, [socket]);

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages]);

  const send = () => {
    const msg = input.trim();
    if (!msg || !socket) return;
    const payload = {
      roomId,
      senderName: currentUserName,
      message: msg,
      timestamp: new Date().toISOString(),
    };
    socket.emit("chat-message", payload);
    setInput("");
  };

  return (
    <div className="h-full flex flex-col border-l border-border bg-panel">
      <div className="p-2 border-b border-border text-sm font-medium text-text">
        Chat
      </div>
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0"
      >
        {messages.map((m, i) => {
          const isMe = m.senderName === currentUserName;
          return (
            <div
              key={i}
              className={isMe ? "text-right" : "text-left"}
            >
              <p className="text-xs text-muted mb-0.5">{m.senderName}</p>
              <p
                className={
                  isMe
                    ? "inline-block text-sm px-2 py-1 rounded-lg bg-accent/30 text-text max-w-[85%]"
                    : "inline-block text-sm px-2 py-1 rounded-lg bg-card border border-border text-text max-w-[85%]"
                }
              >
                {m.message}
              </p>
              <p className="text-xs text-muted">{m.timestamp}</p>
            </div>
          );
        })}
      </div>
      <div className="p-2 border-t border-border flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message..."
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="button"
          onClick={send}
          className="px-3 py-2 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-hover"
        >
          Send
        </button>
      </div>
    </div>
  );
}
