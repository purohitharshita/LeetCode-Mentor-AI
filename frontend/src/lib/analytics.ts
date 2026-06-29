import api from "./api";

export interface DifficultyStats {
  attempted: number;
  solved: number;
  solve_rate: number;
}

export interface TopicStat {
  topic_name: string;
  topic_display_name: string;
  mastery_score: number;
  problems_attempted: number;
  problems_solved: number;
}

export interface RecentAttempt {
  problem_title: string;
  problem_slug: string;
  difficulty: "easy" | "medium" | "hard";
  outcome: "solved" | "partial" | "gave_up";
  hints_used: number;
  time_taken_seconds: number | null;
  created_at: string;
}

export interface AnalyticsSummary {
  total_attempts: number;
  total_solved: number;
  solve_rate: number;
  avg_hints_per_attempt: number;
  current_streak: number;
  difficulty_breakdown: Record<string, DifficultyStats>;
  topic_mastery: TopicStat[];
  recent_attempts: RecentAttempt[];
}

export async function fetchAnalytics(): Promise<AnalyticsSummary> {
  const res = await api.get("/v1/analytics/summary");
  return res.data;
}
