"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchAnalytics } from "@/lib/analytics";
import { updateProfile } from "@/lib/auth";
import api from "@/lib/api";
import type { AnalyticsSummary } from "@/lib/analytics";

type ExperienceLevel = "beginner" | "intermediate" | "advanced";

interface UserProfile {
  experience_level: ExperienceLevel;
  target_companies: string[];
  available_hours_per_day: number;
  onboarding_completed: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  profile: UserProfile | null;
}

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string; icon: string }[] = [
  { value: "beginner", label: "Beginner", icon: "🌱" },
  { value: "intermediate", label: "Intermediate", icon: "⚡" },
  { value: "advanced", label: "Advanced", icon: "🚀" },
];

const COMPANIES = ["google", "amazon", "meta", "microsoft", "apple", "bloomberg"];

const TIME_OPTIONS = [
  { label: "30 min / day", value: 0.5 },
  { label: "1 hour / day", value: 1 },
  { label: "2+ hours / day", value: 2 },
];

function masteryColor(score: number) {
  if (score >= 75) return "bg-green-500";
  if (score >= 50) return "bg-yellow-500";
  if (score >= 25) return "bg-orange-500";
  return "bg-red-500";
}

function outcomeStyle(o: string) {
  if (o === "solved") return "bg-green-500/20 text-green-400 border border-green-500/30";
  if (o === "partial") return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
  return "bg-red-500/20 text-red-400 border border-red-500/30";
}

function diffColor(d: string) {
  return d === "easy" ? "text-green-400" : d === "medium" ? "text-yellow-400" : "text-red-400";
}

function fmt(s: number | null) {
  if (!s) return "—";
  const m = Math.floor(s / 60), sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit state
  const [expLevel, setExpLevel] = useState<ExperienceLevel>("intermediate");
  const [companies, setCompanies] = useState<string[]>([]);
  const [hours, setHours] = useState(1);

  useEffect(() => {
    Promise.all([
      api.get("/v1/users/me"),
      fetchAnalytics().catch(() => null),
    ]).then(([userRes, analyticsData]) => {
      setUser(userRes.data);
      setAnalytics(analyticsData);
      if (userRes.data.profile) {
        setExpLevel(userRes.data.profile.experience_level);
        setCompanies(userRes.data.profile.target_companies || []);
        setHours(userRes.data.profile.available_hours_per_day || 1);
      }
    }).catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, []);

  function toggleCompany(c: string) {
    setCompanies(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateProfile({
        experience_level: expLevel,
        target_companies: companies,
        available_hours_per_day: hours,
        onboarding_completed: true,
      });
      const res = await api.get("/v1/users/me");
      setUser(res.data);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0d1a]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const profile = user.profile;

  return (
    <div className="min-h-screen bg-[#0d0d1a] px-4 py-10">
      <div className="mx-auto max-w-5xl">

        {/* Back */}
        <Link href="/problems" className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#6b6b8a] hover:text-white">
          ← Back to Problems
        </Link>

        {/* Profile header */}
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-[#2d2d4e] bg-[#13131f] p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 text-2xl font-bold text-white shadow-lg shadow-violet-900/40">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{user.name}</h1>
              <p className="text-sm text-[#6b6b8a]">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            disabled={saving}
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : editing ? "Save Changes" : "Edit Profile"}
          </button>
        </div>

        {/* Stats row */}
        {analytics && (
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Attempts", value: analytics.total_attempts, icon: "🎯" },
              { label: "Solved", value: `${analytics.total_solved} (${analytics.solve_rate}%)`, icon: "✅" },
              { label: "Avg Hints", value: analytics.avg_hints_per_attempt, icon: "💡" },
              { label: "Streak", value: `${analytics.current_streak}d 🔥`, icon: "📅" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-[#2d2d4e] bg-[#13131f] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wider text-[#6b6b8a]">{s.label}</p>
                  <span className="text-lg">{s.icon}</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-white">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">

          {/* Profile settings */}
          <div className="space-y-4">

            {/* Experience level */}
            <div className="rounded-2xl border border-[#2d2d4e] bg-[#13131f] p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#6b6b8a]">Experience Level</p>
              {editing ? (
                <div className="space-y-2">
                  {EXPERIENCE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setExpLevel(opt.value)}
                      className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition ${
                        expLevel === opt.value
                          ? "border-violet-500 bg-violet-600/10"
                          : "border-[#2d2d4e] hover:border-[#3d3d5e]"
                      }`}
                    >
                      <span className="text-xl">{opt.icon}</span>
                      <span className="text-sm font-medium text-white">{opt.label}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {EXPERIENCE_OPTIONS.find(o => o.value === profile?.experience_level)?.icon ?? "⚡"}
                  </span>
                  <span className="text-base font-semibold capitalize text-white">
                    {profile?.experience_level ?? "—"}
                  </span>
                </div>
              )}
            </div>

            {/* Target companies */}
            <div className="rounded-2xl border border-[#2d2d4e] bg-[#13131f] p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#6b6b8a]">Target Companies</p>
              {editing ? (
                <div className="grid grid-cols-3 gap-2">
                  {COMPANIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => toggleCompany(c)}
                      className={`rounded-xl border-2 py-2 text-xs font-medium capitalize transition ${
                        companies.includes(c)
                          ? "border-violet-500 bg-violet-600/10 text-violet-300"
                          : "border-[#2d2d4e] text-[#6b6b8a] hover:border-[#3d3d5e]"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile?.target_companies?.length
                    ? profile.target_companies.map((c) => (
                        <span key={c} className="rounded-full border border-violet-500/30 bg-violet-600/10 px-3 py-1 text-xs capitalize text-violet-300">
                          {c}
                        </span>
                      ))
                    : <span className="text-sm text-[#6b6b8a]">No companies selected</span>
                  }
                </div>
              )}
            </div>

            {/* Daily goal */}
            <div className="rounded-2xl border border-[#2d2d4e] bg-[#13131f] p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#6b6b8a]">Daily Practice Goal</p>
              {editing ? (
                <div className="space-y-2">
                  {TIME_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setHours(opt.value)}
                      className={`flex w-full items-center justify-between rounded-xl border-2 px-4 py-2.5 text-sm transition ${
                        hours === opt.value
                          ? "border-violet-500 bg-violet-600/10 text-white"
                          : "border-[#2d2d4e] text-[#6b6b8a] hover:border-[#3d3d5e]"
                      }`}
                    >
                      {opt.label}
                      {hours === opt.value && <span className="text-violet-400">✓</span>}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-base font-semibold text-white">
                  {TIME_OPTIONS.find(o => o.value === profile?.available_hours_per_day)?.label
                    ?? `${profile?.available_hours_per_day}h / day`}
                </p>
              )}
            </div>

            {editing && (
              <button
                onClick={() => setEditing(false)}
                className="w-full rounded-xl border border-[#2d2d4e] py-2.5 text-sm text-[#6b6b8a] transition hover:text-white"
              >
                Cancel
              </button>
            )}
          </div>

          {/* Right column: mastery + recent attempts */}
          <div className="space-y-4">

            {/* Topic mastery */}
            {analytics && analytics.topic_mastery.filter(t => t.problems_attempted > 0).length > 0 && (
              <div className="rounded-2xl border border-[#2d2d4e] bg-[#13131f] p-5">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#6b6b8a]">Topic Mastery</p>
                <div className="space-y-3">
                  {analytics.topic_mastery
                    .filter(t => t.problems_attempted > 0)
                    .map((t) => (
                      <div key={t.topic_name}>
                        <div className="mb-1 flex justify-between">
                          <p className="text-xs text-[#a0a0c0]">{t.topic_display_name}</p>
                          <p className="text-xs text-[#6b6b8a]">{t.problems_solved}/{t.problems_attempted}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#2d2d4e]">
                            <div
                              className={`h-1.5 rounded-full ${masteryColor(t.mastery_score)}`}
                              style={{ width: `${t.mastery_score}%` }}
                            />
                          </div>
                          <span className="w-7 text-right text-xs font-semibold text-white">{t.mastery_score}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Recent attempts */}
            {analytics && analytics.recent_attempts.length > 0 && (
              <div className="rounded-2xl border border-[#2d2d4e] bg-[#13131f] p-5">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#6b6b8a]">Recent Attempts</p>
                <div className="space-y-2">
                  {analytics.recent_attempts.slice(0, 5).map((a, i) => (
                    <Link
                      key={i}
                      href={`/problems/${a.problem_slug}`}
                      className="flex items-center justify-between rounded-xl border border-[#2d2d4e] bg-[#0d0d1a] px-4 py-2.5 transition hover:border-violet-500/30"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{a.problem_title}</p>
                        <p className={`text-xs capitalize ${diffColor(a.difficulty)}`}>{a.difficulty}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#6b6b8a]">{fmt(a.time_taken_seconds)}</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${outcomeStyle(a.outcome)}`}>
                          {a.outcome === "solved" ? "Solved" : a.outcome === "partial" ? "Partial" : "Gave up"}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {(!analytics || analytics.recent_attempts.length === 0) && (
              <div className="rounded-2xl border border-dashed border-[#2d2d4e] p-8 text-center">
                <p className="text-sm text-[#6b6b8a]">No attempts yet</p>
                <Link href="/problems" className="mt-3 inline-block text-xs text-violet-400 hover:text-violet-300">
                  Solve your first problem →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
