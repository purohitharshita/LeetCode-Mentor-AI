import api from "./api";

export type Outcome = "solved" | "partial" | "gave_up";

export interface AttemptPayload {
  problem_id: string;
  outcome: Outcome;
  hints_used: number;
  hint_tiers_used: number[];
  time_taken_seconds?: number;
  code_submitted?: string;
}

export interface Attempt {
  id: string;
  problem_id: string;
  outcome: Outcome;
  hints_used: number;
  hint_tiers_used: number[];
  time_taken_seconds: number | null;
  created_at: string;
}

export interface TopicMastery {
  topic_name: string;
  topic_display_name: string;
  mastery_score: number;
  problems_attempted: number;
  problems_solved: number;
  last_practiced_at: string | null;
}

export async function logAttempt(payload: AttemptPayload): Promise<Attempt> {
  const res = await api.post("/v1/attempts", payload);
  return res.data;
}

export async function fetchMastery(): Promise<TopicMastery[]> {
  const res = await api.get("/v1/attempts/mastery");
  return res.data;
}

export async function fetchAttempts(limit = 20): Promise<Attempt[]> {
  const res = await api.get(`/v1/attempts?limit=${limit}`);
  return res.data;
}
