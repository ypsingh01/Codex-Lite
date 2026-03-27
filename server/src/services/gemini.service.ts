import { GoogleGenerativeAI } from "@google/generative-ai";

function stripJsonFences(text: string) {
  return text.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
}

async function generateJson<T>(system: string, user: string): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: system,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.4,
    },
  });

  try {
    const result = await model.generateContent(user);
    const text = result.response.text();
    const cleaned = stripJsonFences(text);
    try {
      return JSON.parse(cleaned) as T;
    } catch {
      throw new Error("AI response was not valid JSON");
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Gemini request failed";
    throw new Error(msg);
  }
}

export type GeminiAnalysis = {
  approach: string;
  timeComplexity: string;
  spaceComplexity: string;
  codeQuality: string;
  optimizationSuggestions: string[];
  overallScore: number;
};

export type GeminiMockQuestion = {
  title: string;
  description: string;
  examples: Array<{ input: string; output: string; explanation: string }>;
  constraints: string[];
};

export async function analyzeCodeWithGemini(params: {
  problem: string;
  code: string;
  language: string;
}): Promise<GeminiAnalysis> {
  const system =
    "You are a senior software engineer reviewing interview code. Respond ONLY with valid JSON. No markdown fences. No extra text.";
  const user = `Problem: ${params.problem}\nLanguage: ${params.language}\nCode: ${params.code}\n\nReturn this exact JSON structure:\n{\n  \"approach\": \"string\",\n  \"timeComplexity\": \"string\",\n  \"spaceComplexity\": \"string\",\n  \"codeQuality\": \"string\",\n  \"optimizationSuggestions\": [\"string\"],\n  \"overallScore\": number between 1 and 10\n}`;

  return generateJson<GeminiAnalysis>(system, user);
}

export async function generateMockQuestionWithGemini(params: {
  difficulty: "easy" | "medium" | "hard";
}): Promise<GeminiMockQuestion> {
  const system =
    "You are a technical interviewer creating coding problems. Respond ONLY with valid JSON. No markdown fences. No extra text.";
  const user = `Generate a ${params.difficulty} level coding interview question. Return this exact JSON structure:\n{\n  \"title\": \"string\",\n  \"description\": \"string in markdown format\",\n  \"examples\": [\n    {\n      \"input\": \"string\",\n      \"output\": \"string\",\n      \"explanation\": \"string\"\n    }\n  ],\n  \"constraints\": [\"string\"]\n}`;

  return generateJson<GeminiMockQuestion>(system, user);
}

