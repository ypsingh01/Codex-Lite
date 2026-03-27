export type UserRole = "candidate" | "interviewer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  examples: Array<{ input: string; output: string; explanation: string }>;
  constraints: string[];
  tags: string[];
  createdBy?: string | null;
  createdAt?: string;
}

export interface Review {
  id?: string;
  interviewId: string;
  problemSolvingScore: number;
  codeQualityScore: number;
  optimizationScore: number;
  communicationScore: number;
  writtenFeedback: string;
  submittedAt?: string;
}

export type InterviewStatus = "scheduled" | "ongoing" | "completed" | "cancelled";

export interface Interview {
  _id: string;
  interviewerId: User | string;
  candidateId: User | string;
  questionId: Question | string;
  scheduledAt: string;
  durationMins: number;
  meetLink: string;
  status: InterviewStatus;
  roomId: string;
  reviewId?: Review | string | null;
  createdAt?: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  compileOutput: string;
  status: string;
  time: string | null;
  memory: number | null;
}

export interface AiFeedback {
  approach: string;
  timeComplexity: string;
  spaceComplexity: string;
  codeQuality: string;
  optimizationSuggestions: string[];
  overallScore: number;
}

export interface MockQuestion {
  title: string;
  description: string;
  examples: Array<{ input: string; output: string; explanation: string }>;
  constraints: string[];
}

export const LANGUAGE_IDS: Record<string, number> = {
  python: 71,
  javascript: 63,
  java: 62,
  "c++": 54,
};
