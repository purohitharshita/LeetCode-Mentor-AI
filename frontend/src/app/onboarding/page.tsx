"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/lib/auth";

const STEPS = ["Experience", "Companies", "Schedule"] as const;

const EXPERIENCE_OPTIONS = [
  { value: "beginner", label: "Beginner", icon: "🌱", description: "New to DSA, just started learning algorithms and data structures" },
  { value: "intermediate", label: "Intermediate", icon: "⚡", description: "Know the basics, actively preparing for technical interviews" },
  { value: "advanced", label: "Advanced", icon: "🚀", description: "Targeting FAANG, need focused practice on hard problems" },
] as const;

const COMPANY_OPTIONS = [
  { label: "Google", value: "google" },
  { label: "Amazon", value: "amazon" },
  { label: "Meta", value: "meta" },
  { label: "Microsoft", value: "microsoft" },
  { label: "Apple", value: "apple" },
  { label: "Bloomberg", value: "bloomberg" },
];

const TIME_OPTIONS = [
  { label: "30 min / day", value: 0.5, icon: "⚡" },
  { label: "1 hour / day", value: 1, icon: "🎯" },
  { label: "2+ hours / day", value: 2, icon: "🔥" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [experienceLevel, setExperienceLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [targetCompanies, setTargetCompanies] = useState<string[]>([]);
  const [hoursPerDay, setHoursPerDay] = useState(1);

  function toggleCompany(company: string) {
    setTargetCompanies((prev) =>
      prev.includes(company) ? prev.filter((c) => c !== company) : [...prev, company]
    );
  }

  async function handleFinish() {
    setSaving(true);
    try {
      await updateProfile({ experience_level: experienceLevel, target_companies: targetCompanies, available_hours_per_day: hoursPerDay, onboarding_completed: true });
      router.push("/problems");
    } catch { setSaving(false); }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#0d0d1a] px-4">
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-700/20 blur-[80px]" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600/20 text-base">🧠</div>
          <span className="text-sm font-semibold text-white">LeetCode Mentor AI</span>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between">
            {STEPS.map((s, i) => (
              <span key={s} className={`text-xs font-medium transition ${i <= step ? "text-violet-400" : "text-[#4a4a6a]"}`}>
                {s}
              </span>
            ))}
          </div>
          <div className="h-1 w-full rounded-full bg-[#2d2d4e]">
            <div
              className="h-1 rounded-full bg-gradient-to-r from-violet-600 to-purple-500 transition-all duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-[#2d2d4e] bg-[#13131f] p-8">

          {/* Step 1 */}
          {step === 0 && (
            <div>
              <h2 className="text-xl font-bold text-white">What's your experience level?</h2>
              <p className="mt-1 text-sm text-[#6b6b8a]">This helps us recommend the right problems for you.</p>
              <div className="mt-6 space-y-3">
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setExperienceLevel(opt.value)}
                    className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition ${
                      experienceLevel === opt.value
                        ? "border-violet-500 bg-violet-600/10"
                        : "border-[#2d2d4e] hover:border-[#3d3d5e]"
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                      <p className="font-semibold text-white">{opt.label}</p>
                      <p className="mt-0.5 text-xs text-[#6b6b8a]">{opt.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-white">Which companies are you targeting?</h2>
              <p className="mt-1 text-sm text-[#6b6b8a]">We'll prioritize problems from your target companies.</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {COMPANY_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => toggleCompany(c.value)}
                    className={`rounded-xl border-2 py-3 text-sm font-medium transition ${
                      targetCompanies.includes(c.value)
                        ? "border-violet-500 bg-violet-600/10 text-violet-300"
                        : "border-[#2d2d4e] text-[#6b6b8a] hover:border-[#3d3d5e] hover:text-white"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-[#4a4a6a]">
                {targetCompanies.length === 0 ? "Skip to see all problems" : `${targetCompanies.length} selected`}
              </p>
            </div>
          )}

          {/* Step 3 */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-white">How much time can you practice daily?</h2>
              <p className="mt-1 text-sm text-[#6b6b8a]">We'll pace your learning roadmap around your schedule.</p>
              <div className="mt-6 space-y-3">
                {TIME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setHoursPerDay(opt.value)}
                    className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition ${
                      hoursPerDay === opt.value
                        ? "border-violet-500 bg-violet-600/10"
                        : "border-[#2d2d4e] hover:border-[#3d3d5e]"
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <p className="font-semibold text-white">{opt.label}</p>
                    {hoursPerDay === opt.value && <span className="ml-auto text-violet-400">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="rounded-xl px-4 py-2 text-sm text-[#6b6b8a] transition hover:text-white disabled:opacity-0"
            >
              Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={saving}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Start Learning →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
