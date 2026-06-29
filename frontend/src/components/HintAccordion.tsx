"use client";

import { useState } from "react";
import type { ProblemHint } from "@/lib/problems";

interface HintAccordionProps {
  hints: ProblemHint[];
  onHintRevealed?: (tier: number) => void;
}

const TIER_LABELS: Record<number, string> = {
  1: "Nudge",
  2: "Direction",
  3: "Approach",
  4: "Pseudocode",
};

export default function HintAccordion({ hints, onHintRevealed }: HintAccordionProps) {
  const [revealed, setReveal] = useState(0);

  const sorted = [...hints].sort((a, b) => a.tier - b.tier);

  return (
    <div className="space-y-3">
      {sorted.map((hint, idx) => {
        const isUnlocked = idx < revealed;
        const isNext = idx === revealed;

        return (
          <div
            key={hint.tier}
            className="rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Hint {hint.tier} — {TIER_LABELS[hint.tier] ?? "Hint"}
              </span>
              {!isUnlocked && (
                <button
                  disabled={!isNext}
                  onClick={() => { setReveal((r) => r + 1); onHintRevealed?.(hint.tier); }}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                    isNext
                      ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800"
                  }`}
                >
                  {isNext ? "Reveal" : "Locked"}
                </button>
              )}
            </div>

            {isUnlocked && (
              <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700">
                <p className="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400">
                  {hint.content}
                </p>
              </div>
            )}
          </div>
        );
      })}

      {revealed === 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Try the problem first. Reveal hints only when genuinely stuck.
        </p>
      )}
    </div>
  );
}
