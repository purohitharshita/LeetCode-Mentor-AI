"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/lib/auth";

const STEPS = ["Experience", "Companies", "Schedule"] as const;

const EXPERIENCE_OPTIONS = [
  {
    value: "beginner",
    label: "Beginner",
    description: "New to DSA, just started learning algorithms and data structures",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "Know the basics, actively preparing for technical interviews",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "Targeting FAANG, need focused practice on hard problems",
  },
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
  { label: "30 min / day", value: 0.5 },
  { label: "1 hour / day", value: 1 },
  { label: "2+ hours / day", value: 2 },
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
      await updateProfile({
        experience_level: experienceLevel,
        target_companies: targetCompanies,
        available_hours_per_day: hoursPerDay,
        onboarding_completed: true,
      });
      router.push("/problems");
    } catch {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-lg">

        {/* Progress */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-xs text-gray-400">
            {STEPS.map((s, i) => (
              <span key={s} className={i <= step ? "text-blue-600 font-medium dark:text-blue-400" : ""}>
                {s}
              </span>
            ))}
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-1.5 rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">

          {/* Step 1 — Experience */}
          {step === 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                What's your experience level?
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                This helps us recommend the right problems for you.
              </p>
              <div className="mt-6 space-y-3">
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setExperienceLevel(opt.value)}
                    className={`w-full rounded-xl border-2 p-4 text-left transition ${
                      experienceLevel === opt.value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                    }`}
                  >
                    <p className="font-semibold text-gray-900 dark:text-white">{opt.label}</p>
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{opt.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Companies */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Which companies are you targeting?
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                We'll prioritize problems frequently asked at your target companies.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {COMPANY_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => toggleCompany(c.value)}
                    className={`rounded-xl border-2 py-3 text-sm font-medium transition ${
                      targetCompanies.includes(c.value)
                        ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                        : "border-gray-200 text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-400">
                {targetCompanies.length === 0 ? "Skip to see all problems" : `${targetCompanies.length} selected`}
              </p>
            </div>
          )}

          {/* Step 3 — Schedule */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                How much time can you practice daily?
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                We'll pace your learning roadmap around your schedule.
              </p>
              <div className="mt-6 space-y-3">
                {TIME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setHoursPerDay(opt.value)}
                    className={`w-full rounded-xl border-2 p-4 text-left transition ${
                      hoursPerDay === opt.value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                    }`}
                  >
                    <p className="font-semibold text-gray-900 dark:text-white">{opt.label}</p>
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
              className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-0"
            >
              Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={saving}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
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
