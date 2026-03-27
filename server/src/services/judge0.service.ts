import axios from "axios";

function b64Encode(value: string) {
  return Buffer.from(value, "utf8").toString("base64");
}

function b64Decode(value?: string | null) {
  if (!value) return "";
  try {
    return Buffer.from(value, "base64").toString("utf8");
  } catch {
    return "";
  }
}

export type Judge0Result = {
  stdout: string;
  stderr: string;
  compileOutput: string;
  status: string;
  time: string | null;
  memory: number | null;
};

function mapStatus(statusId?: number, description?: string) {
  switch (statusId) {
    case 3:
      return "Accepted";
    case 5:
      return "Time Limit Exceeded";
    case 6:
      return "Compilation Error";
    case 11:
      return "Runtime Error";
    default:
      return description || "Unknown";
  }
}

export async function runOnJudge0(params: {
  code: string;
  languageId: number;
  stdin?: string;
}): Promise<Judge0Result> {
  const baseUrl = process.env.JUDGE0_BASE_URL || "https://judge0-ce.p.rapidapi.com";
  const apiKey = process.env.JUDGE0_API_KEY || "";
  if (!apiKey) throw new Error("JUDGE0_API_KEY is missing");

  const url = `${baseUrl.replace(/\/+$/, "")}/submissions?base64_encoded=true&wait=true`;

  const response = await axios.post(
    url,
    {
      source_code: b64Encode(params.code),
      language_id: params.languageId,
      stdin: b64Encode(params.stdin ?? ""),
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
      timeout: 60_000,
    },
  );

  const data = response.data as {
    stdout?: string | null;
    stderr?: string | null;
    compile_output?: string | null;
    status?: { id?: number; description?: string };
    time?: string | null;
    memory?: number | null;
  };

  return {
    stdout: b64Decode(data.stdout),
    stderr: b64Decode(data.stderr),
    compileOutput: b64Decode(data.compile_output),
    status: mapStatus(data.status?.id, data.status?.description),
    time: data.time ?? null,
    memory: typeof data.memory === "number" ? data.memory : null,
  };
}

