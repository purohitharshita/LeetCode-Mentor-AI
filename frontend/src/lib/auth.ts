import api from "./api";

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    name: string;
    is_active: boolean;
    created_at: string;
    profile: {
      experience_level: string;
      target_companies: string[];
      available_hours_per_day: number;
      onboarding_completed: boolean;
    } | null;
  };
}

export interface UpdateProfilePayload {
  experience_level: "beginner" | "intermediate" | "advanced";
  target_companies: string[];
  available_hours_per_day: number;
  onboarding_completed: boolean;
}

export async function register(
  email: string,
  name: string,
  password: string
): Promise<AuthResponse> {
  const res = await api.post("/v1/auth/register", { email, name, password });
  return res.data;
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await api.post("/v1/auth/login", { email, password });
  return res.data;
}

export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<void> {
  await api.patch("/v1/users/profile", payload);
}

export function saveTokens(access: string, refresh: string) {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export function isOnboardingComplete(auth: AuthResponse): boolean {
  return auth.user.profile?.onboarding_completed === true;
}
