import api from "./api";

export interface MentorMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface MentorSession {
  id: string;
  problem_id: string;
  started_at: string;
  messages: MentorMessage[];
}

export async function startSession(problem_id: string): Promise<MentorSession> {
  const res = await api.post("/v1/mentor/sessions", { problem_id });
  return res.data;
}

export async function getSession(session_id: string): Promise<MentorSession> {
  const res = await api.get(`/v1/mentor/sessions/${session_id}`);
  return res.data;
}

export async function sendMessage(
  session_id: string,
  message: string,
  code?: string
): Promise<MentorMessage> {
  const res = await api.post(`/v1/mentor/sessions/${session_id}/chat`, {
    message,
    code: code || null,
  });
  return res.data.message;
}
