import api from "./api";

export interface Topic {
  id: string;
  name: string;
  display_name: string;
  description?: string;
}

export interface ProblemTopic {
  name: string;
  display_name: string;
  is_primary: boolean;
}

export interface ProblemHint {
  tier: number;
  content: string;
}

export interface ProblemListItem {
  id: string;
  title: string;
  slug: string;
  difficulty: "easy" | "medium" | "hard";
  companies: string[];
  topics: ProblemTopic[];
}

export interface ProblemDetail extends ProblemListItem {
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  hints: ProblemHint[];
}

export interface ProblemListResponse {
  items: ProblemListItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface ProblemsFilter {
  topic?: string;
  difficulty?: string;
  company?: string;
  page?: number;
  page_size?: number;
}

export async function fetchTopics(): Promise<Topic[]> {
  const res = await api.get("/v1/problems/topics");
  return res.data;
}

export async function fetchProblems(
  filters: ProblemsFilter = {}
): Promise<ProblemListResponse> {
  const params = new URLSearchParams();
  if (filters.topic) params.set("topic", filters.topic);
  if (filters.difficulty) params.set("difficulty", filters.difficulty);
  if (filters.company) params.set("company", filters.company);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));
  const res = await api.get(`/v1/problems?${params.toString()}`);
  return res.data;
}

export async function fetchProblem(slug: string): Promise<ProblemDetail> {
  const res = await api.get(`/v1/problems/${slug}`);
  return res.data;
}
