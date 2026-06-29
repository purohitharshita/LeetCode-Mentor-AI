"use client";

import { useEffect, useState } from "react";
import { fetchMastery } from "@/lib/attempts";
import type { TopicMastery } from "@/lib/attempts";

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 75 ? "bg-green-500" :
    score >= 50 ? "bg-yellow-500" :
    score >= 25 ? "bg-orange-500" :
    "bg-red-500";

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs font-medium text-gray-600 dark:text-gray-400">
        {score}
      </span>
    </div>
  );
}

export default function MasteryBar() {
  const [mastery, setMastery] = useState<TopicMastery[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchMastery()
      .then(setMastery)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || mastery.length === 0) return null;

  const topWeak = mastery
    .filter((m) => m.problems_attempted > 0)
    .sort((a, b) => a.mastery_score - b.mastery_score)
    .slice(0, 3);

  const avgScore = Math.round(
    mastery.reduce((s, m) => s + m.mastery_score, 0) / mastery.length
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Your Mastery
          </p>
          <p className="mt-0.5 text-2xl font-bold text-gray-900 dark:text-white">
            {avgScore}
            <span className="text-sm font-normal text-gray-400">/100</span>
          </p>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="text-xs text-blue-600 hover:underline dark:text-blue-400"
        >
          {open ? "Hide" : "Show all"}
        </button>
      </div>

      {/* Weak topics always visible */}
      {topWeak.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-xs text-gray-400">Weakest topics</p>
          <div className="space-y-2">
            {topWeak.map((m) => (
              <div key={m.topic_name}>
                <p className="mb-0.5 text-xs text-gray-600 dark:text-gray-300">
                  {m.topic_display_name}
                </p>
                <ScoreBar score={m.mastery_score} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All topics expanded */}
      {open && (
        <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 dark:border-gray-700">
          <p className="mb-2 text-xs text-gray-400">All topics</p>
          {mastery
            .filter((m) => m.problems_attempted > 0)
            .sort((a, b) => b.mastery_score - a.mastery_score)
            .map((m) => (
              <div key={m.topic_name}>
                <div className="flex justify-between">
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {m.topic_display_name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {m.problems_solved}/{m.problems_attempted}
                  </p>
                </div>
                <ScoreBar score={m.mastery_score} />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
