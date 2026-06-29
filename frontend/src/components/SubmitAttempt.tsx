"use client";

import { useState } from "react";
import { logAttempt } from "@/lib/attempts";
import { getStarterCode } from "@/lib/starterCode";
import type { Outcome } from "@/lib/attempts";
import type { Language } from "@/lib/starterCode";

interface SubmitAttemptProps {
  problemId: string;
  problemSlug: string;
  language: Language;
  hintsUsed: number;
  hintTiersUsed: number[];
  code: string;
  elapsedSeconds: number;
  onSubmitted: (outcome: Outcome) => void;
}

const OUTCOMES: { value: Outcome; label: string; description: string; color: string }[] = [
  {
    value: "solved",
    label: "Solved",
    description: "I solved it independently or with minimal help",
    color: "border-green-400 bg-green-50 dark:bg-green-900/20",
  },
  {
    value: "partial",
    label: "Partial",
    description: "I made progress but couldn't complete it",
    color: "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20",
  },
  {
    value: "gave_up",
    label: "Gave Up",
    description: "I need to revisit this problem later",
    color: "border-red-400 bg-red-50 dark:bg-red-900/20",
  },
];

export default function SubmitAttempt({
  problemId,
  problemSlug,
  language,
  hintsUsed,
  hintTiersUsed,
  code,
  elapsedSeconds,
  onSubmitted,
}: SubmitAttemptProps) {
  const [selected, setSelected] = useState<Outcome | null>(null);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isUnchanged = code.trim() === getStarterCode(problemSlug, language).trim();

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  }

  async function handleSubmit() {
    if (!selected) return;
    setSubmitting(true);
    try {
      await logAttempt({
        problem_id: problemId,
        outcome: selected,
        hints_used: hintsUsed,
        hint_tiers_used: hintTiersUsed,
        time_taken_seconds: elapsedSeconds,
        code_submitted: code || undefined,
      });
      onSubmitted(selected);
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-lg border border-gray-200 bg-white py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        Submit Attempt
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              How did it go?
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              This helps us track your progress and improve recommendations.
            </p>

            {/* Stats summary */}
            <div className="mt-4 flex gap-3">
              <div className="flex-1 rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-700">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatTime(elapsedSeconds)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Time spent</p>
              </div>
              <div className="flex-1 rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-700">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{hintsUsed}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Hints used</p>
              </div>
            </div>

            {/* Warning if code is unchanged */}
            {isUnchanged && (
              <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400">
                ⚠️ Your code looks like the starter template. Write your solution before marking as Solved.
              </div>
            )}

            {/* Outcome selection */}
            <div className="mt-4 space-y-2">
              {OUTCOMES.map((opt) => {
                const disableSolved = opt.value === "solved" && isUnchanged;
                return (
                  <button
                    key={opt.value}
                    onClick={() => !disableSolved && setSelected(opt.value)}
                    disabled={disableSolved}
                    className={`w-full rounded-xl border-2 p-3 text-left transition ${
                      disableSolved
                        ? "cursor-not-allowed border-gray-100 opacity-40 dark:border-gray-700"
                        : selected === opt.value
                        ? opt.color
                        : "border-gray-200 hover:border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {opt.label}
                      {disableSolved && <span className="ml-2 text-xs font-normal text-gray-400">(write your solution first)</span>}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{opt.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 rounded-lg border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selected || submitting}
                className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save attempt"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
