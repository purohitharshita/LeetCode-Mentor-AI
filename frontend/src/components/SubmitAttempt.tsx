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

const OUTCOMES: { value: Outcome; label: string; description: string; active: string }[] = [
  { value: "solved", label: "✅ Solved", description: "I solved it independently or with minimal help", active: "border-green-500 bg-green-500/10" },
  { value: "partial", label: "⚡ Partial", description: "I made progress but couldn't complete it", active: "border-yellow-500 bg-yellow-500/10" },
  { value: "gave_up", label: "🔄 Gave Up", description: "I need to revisit this problem later", active: "border-red-500 bg-red-500/10" },
];

export default function SubmitAttempt({ problemId, problemSlug, language, hintsUsed, hintTiersUsed, code, elapsedSeconds, onSubmitted }: SubmitAttemptProps) {
  const [selected, setSelected] = useState<Outcome | null>(null);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isUnchanged = code.trim() === getStarterCode(problemSlug, language).trim();

  function formatTime(s: number) {
    const m = Math.floor(s / 60), sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  }

  async function handleSubmit() {
    if (!selected) return;
    setSubmitting(true);
    try {
      await logAttempt({ problem_id: problemId, outcome: selected, hints_used: hintsUsed, hint_tiers_used: hintTiersUsed, time_taken_seconds: elapsedSeconds, code_submitted: code || undefined });
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
        className="w-full rounded-xl border border-[#2d2d4e] bg-[#13131f] py-2 text-sm font-medium text-[#a0a0c0] transition hover:border-violet-500/50 hover:text-white"
      >
        Submit Attempt
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#2d2d4e] bg-[#13131f] p-6 shadow-2xl shadow-black/50">
            <h2 className="text-lg font-bold text-white">How did it go?</h2>
            <p className="mt-1 text-sm text-[#6b6b8a]">This helps track your progress and improve recommendations.</p>

            {/* Stats */}
            <div className="mt-4 flex gap-3">
              <div className="flex-1 rounded-xl bg-[#0d0d1a] border border-[#2d2d4e] p-3 text-center">
                <p className="text-lg font-bold text-white">{formatTime(elapsedSeconds)}</p>
                <p className="text-xs text-[#6b6b8a]">Time spent</p>
              </div>
              <div className="flex-1 rounded-xl bg-[#0d0d1a] border border-[#2d2d4e] p-3 text-center">
                <p className="text-lg font-bold text-white">{hintsUsed}</p>
                <p className="text-xs text-[#6b6b8a]">Hints used</p>
              </div>
            </div>

            {/* Warning */}
            {isUnchanged && (
              <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
                ⚠️ Your code looks like the starter template. Write your solution before marking as Solved.
              </div>
            )}

            {/* Outcomes */}
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
                        ? "cursor-not-allowed border-[#2d2d4e] opacity-30"
                        : selected === opt.value
                        ? opt.active
                        : "border-[#2d2d4e] hover:border-[#3d3d5e]"
                    }`}
                  >
                    <p className="text-sm font-semibold text-white">
                      {opt.label}
                      {disableSolved && <span className="ml-2 text-xs font-normal text-[#6b6b8a]">(write your solution first)</span>}
                    </p>
                    <p className="text-xs text-[#6b6b8a]">{opt.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border border-[#2d2d4e] py-2.5 text-sm text-[#6b6b8a] transition hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selected || submitting}
                className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
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
