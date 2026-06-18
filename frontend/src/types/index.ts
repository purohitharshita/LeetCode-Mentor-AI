export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface UserProfile {
  experience_level: "beginner" | "intermediate" | "advanced";
  target_companies: string[];
  available_hours_per_day: number;
  onboarding_completed: boolean;
}

export type Difficulty = "easy" | "medium" | "hard";

export interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  topics: string[];
  patterns: string[];
  companies: string[];
}

export interface Attempt {
  id: string;
  problem_id: string;
  outcome: "solved" | "partial" | "gave_up";
  hints_used: number;
  time_taken_seconds: number;
  created_at: string;
}

export interface TopicMastery {
  topic: string;
  mastery_score: number;
  problems_attempted: number;
  problems_solved: number;
}

export interface MentorMessage {
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}
