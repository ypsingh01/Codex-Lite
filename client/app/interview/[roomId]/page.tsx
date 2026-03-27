"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import type { ApiEnvelope } from "@/types";
import type { Interview, Question, User } from "@/types";
import { Navbar } from "@/components/layout/Navbar";
import { ProblemStatement } from "@/components/interview/ProblemStatement";
import { CodeEditor } from "@/components/interview/CodeEditor";
import { ChatPanel } from "@/components/interview/ChatPanel";
import { OutputConsole } from "@/components/interview/OutputConsole";
import { FeedbackModal } from "@/components/modals/FeedbackModal";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useAuthStore } from "@/store/authStore";
import { useSocket } from "@/hooks/useSocket";
import { LANGUAGE_IDS } from "@/types";
import { cn } from "@/lib/utils";

export default function InterviewRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const { user } = useAuthStore();
  const { socket, isConnected } = useSocket();

  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [runLoading, setRunLoading] = useState(false);
  const [output, setOutput] = useState<{
    stdout: string;
    stderr: string;
    compileOutput: string;
    status: string;
    time: string | null;
    memory: number | null;
  } | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [codeForRun, setCodeForRun] = useState("");
  const [languageForRun, setLanguageForRun] = useState("python");

  const isInterviewer = user?.role === "interviewer";
  const question = interview?.questionId as Question | undefined;
  const hasReview = !!interview?.reviewId;

  const loadInterview = useCallback(async () => {
    try {
      const { data } = await api.get<ApiEnvelope<Interview>>(
        `/interviews/room/${roomId}`
      );
      if (data.success && data.data) setInterview(data.data);
      else router.replace("/login");
    } catch {
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [roomId, router]);

  useEffect(() => {
    loadInterview();
  }, [loadInterview]);

  useEffect(() => {
    if (!socket || !user || !interview) return;
    socket.emit("join-room", {
      roomId,
      userId: user.id,
      role: user.role,
    });
    return () => {
      socket.emit("leave-room", { roomId });
    };
  }, [socket, user, interview, roomId]);

  const handleRunCode = async () => {
    const langId = LANGUAGE_IDS[languageForRun] ?? 71;
    setRunLoading(true);
    setOutput(null);
    try {
      const { data } = await api.post<ApiEnvelope<typeof output>>("/execute", {
        code: codeForRun,
        languageId: langId,
        stdin: "",
      });
      if (data.success && data.data) setOutput(data.data);
    } catch {
      setOutput({
        stdout: "",
        stderr: "Execution request failed.",
        compileOutput: "",
        status: "Error",
        time: null,
        memory: null,
      });
    } finally {
      setRunLoading(false);
    }
  };

  const handleEndInterview = () => {
    if (!hasReview) {
      setFeedbackModalOpen(true);
      return;
    }
    socket?.emit("end-interview", { roomId });
    router.push(isInterviewer ? "/interviewer/dashboard" : "/candidate/dashboard");
  };

  const handleReviewSubmitted = () => {
    setFeedbackModalOpen(false);
    loadInterview().then(() => {
      socket?.emit("end-interview", { roomId });
      router.push("/interviewer/dashboard");
    });
  };

  const handleStartInterview = () => {
    socket?.emit("start-interview", { roomId });
  };

  if (loading || !interview) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const status = interview.status;
  const statusClass = cn(
    "text-xs font-medium px-2 py-0.5 rounded",
    status === "scheduled" && "bg-accent/20 text-accent",
    status === "ongoing" && "bg-warning/20 text-warning",
    status === "completed" && "bg-success/20 text-success",
    status === "cancelled" && "bg-danger/20 text-danger"
  );

  return (
    <div className="h-screen flex flex-col bg-background">
      <Navbar
        title={`CODEX · ${roomId}`}
        right={
          <div className="flex items-center gap-3">
            <span className={statusClass}>{status}</span>
            {interview.meetLink && (
              <a
                href={interview.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Meet
              </a>
            )}
            {isInterviewer && (
              <button
                type="button"
                onClick={handleEndInterview}
                className="rounded-md border border-danger text-danger px-3 py-1.5 text-sm hover:bg-danger/10"
              >
                End Interview
              </button>
            )}
          </div>
        }
      />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0">
        <div className="lg:col-span-4 flex flex-col min-h-0 border-r border-border">
          {question && <ProblemStatement question={question} />}
          {isInterviewer && status === "scheduled" && (
            <div className="p-2 border-t border-border">
              <button
                type="button"
                onClick={handleStartInterview}
                className="w-full rounded-md bg-accent py-2 text-white text-sm font-medium"
              >
                Start Interview
              </button>
            </div>
          )}
        </div>
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <ChatPanel
            roomId={roomId}
            currentUserName={user?.name ?? "User"}
            socket={socket}
          />
        </div>
        <div className="lg:col-span-6 flex flex-col min-h-0">
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center gap-2 p-2 border-b border-border bg-panel">
              <button
                type="button"
                onClick={handleRunCode}
                disabled={runLoading}
                className="rounded-md bg-accent px-3 py-1.5 text-sm text-white hover:bg-accent-hover disabled:opacity-50"
              >
                Run Code
              </button>
            </div>
            <CodeEditor
              roomId={roomId}
              socket={socket}
              onCodeChange={(code, lang) => {
                setCodeForRun(code);
                setLanguageForRun(lang);
              }}
            />
          </div>
          <OutputConsole
            output={output?.stdout}
            error={output?.stderr || output?.compileOutput}
            status={output?.status}
            time={output?.time}
            memory={output?.memory}
            isLoading={runLoading}
          />
        </div>
      </div>

      <FeedbackModal
        open={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        interviewId={interview._id}
        onSuccess={handleReviewSubmitted}
      />
    </div>
  );
}
