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
          <div key={hint.tier} className="rounded-xl border border-[#2d2d4e] bg-[#13131f] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium text-[#a0a0c0]">
                Hint {hint.tier} —{" "}
                <span className="text-violet-400">{TIER_LABELS[hint.tier] ?? "Hint"}</span>
              </span>
              {!isUnlocked && (
                <button
                  disabled={!isNext}
                  onClick={() => { setReveal((r) => r + 1); onHintRevealed?.(hint.tier); }}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                    isNext
                      ? "bg-violet-600 text-white hover:bg-violet-700 cursor-pointer"
                      : "bg-[#2d2d4e] text-[#4a4a6a] cursor-not-allowed"
                  }`}
                >
                  {isNext ? "Reveal" : "🔒 Locked"}
                </button>
              )}
              {isUnlocked && (
                <span className="text-xs text-green-400">✓ Revealed</span>
              )}
            </div>

            {isUnlocked && (
              <div className="border-t border-[#2d2d4e] bg-[#0d0d1a] px-4 py-3">
                <p className="whitespace-pre-wrap text-sm text-[#a0a0c0]">{hint.content}</p>
              </div>
            )}
          </div>
        );
      })}

      {revealed === 0 && (
        <p className="text-xs text-[#4a4a6a]">Try the problem first. Reveal hints only when genuinely stuck.</p>
      )}
    </div>
  );
}
